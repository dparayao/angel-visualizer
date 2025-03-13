import pretty_midi
import numpy as np
import json
import os
import glob
import librosa
import librosa.display
import matplotlib.pyplot as plt
from pathlib import Path
import base64
from io import BytesIO

def analyze_audio_file(audio_file, output_dir=None):
    """
    Analyze audio file using librosa to extract waveform and spectrogram,
    saving images for visualization and returning key metrics.
    """
    try:
        # Load the audio file
        y, sr = librosa.load(audio_file, sr=None)
        
        # Create output directory for images if specified
        if output_dir:
            os.makedirs(output_dir, exist_ok=True)
            
        # Extract file name without extension
        file_name = os.path.basename(audio_file).split('.')[0]
        
        # Generate waveform image
        waveform_data = None
        if output_dir:
            plt.figure(figsize=(10, 3))
            plt.plot(np.linspace(0, len(y)/sr, len(y)), y)
            plt.title(f"Waveform: {file_name}")
            plt.xlabel("Time (s)")
            plt.ylabel("Amplitude")
            plt.tight_layout()
            
            # Save to buffer for base64 encoding
            buffer = BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            waveform_data = base64.b64encode(buffer.read()).decode('utf-8')
            
            # Also save to file
            plt.savefig(f"{output_dir}/{file_name}_waveform.png")
            plt.close()
        
        # Generate spectrogram image
        spectrogram_data = None
        if output_dir:
            plt.figure(figsize=(10, 6))
            D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)
            librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='log')
            plt.colorbar(format='%+2.0f dB')
            plt.title(f"Spectrogram: {file_name}")
            plt.tight_layout()
            
            # Save to buffer for base64 encoding
            buffer = BytesIO()
            plt.savefig(buffer, format='png')
            buffer.seek(0)
            spectrogram_data = base64.b64encode(buffer.read()).decode('utf-8')
            
            # Also save to file
            plt.savefig(f"{output_dir}/{file_name}_spectrogram.png")
            plt.close()
        
        # Extract onset strength (useful for detecting transients in breaks)
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        
        # Detect tempo
        tempo, _ = librosa.beat.beat_track(y=y, sr=sr)
        
        # Extract rhythmic pattern based on onset strength
        rhythm_pattern = []
        if len(onset_env) > 0:
            # Normalize and quantize to 16 steps
            quantized_length = 16
            resampled_onsets = np.interp(
                np.linspace(0, len(onset_env)-1, quantized_length),
                np.arange(len(onset_env)),
                onset_env
            )
            # Normalize to 0-1 range
            max_val = np.max(resampled_onsets)
            if max_val > 0:
                normalized = resampled_onsets / max_val
                rhythm_pattern = normalized.tolist()
            else:
                rhythm_pattern = resampled_onsets.tolist()
        
        # Calculate spectral features
        spectral_centroid = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_bandwidth = librosa.feature.spectral_bandwidth(y=y, sr=sr)[0]
        
        # Calculate RMS energy
        rms = librosa.feature.rms(y=y)[0]
        
        # Return analysis results
        return {
            "type": "audio",
            "duration": float(len(y) / sr),
            "sample_rate": sr,
            "tempo": float(tempo),
            "onset_count": len(onset_frames),
            "onset_density": float(len(onset_frames) / (len(y) / sr)) if len(y) > 0 else 0,
            "rhythm_pattern": rhythm_pattern,
            "spectral_centroid_mean": float(np.mean(spectral_centroid)),
            "spectral_bandwidth_mean": float(np.mean(spectral_bandwidth)),
            "rms_mean": float(np.mean(rms)),
            "rms_max": float(np.max(rms)) if len(rms) > 0 else 0,
            "has_waveform_image": waveform_data is not None,
            "has_spectrogram_image": spectrogram_data is not None,
            "waveform_base64": waveform_data,
            "spectrogram_base64": spectrogram_data
        }
    except Exception as e:
        return {"error": str(e), "type": "audio"}

def analyze_midi_file(midi_file):
    """
    Analyze MIDI file to extract musical patterns and features for visualization.
    """
    try:
        midi_data = pretty_midi.PrettyMIDI(midi_file)
        
        # Extract notes from all instruments
        all_notes = [note for instrument in midi_data.instruments for note in instrument.notes]
        
        if not all_notes:
            return {"error": "No notes found in MIDI file", "type": "midi"}
        
        # Find most common notes (pitch classes)
        pitch_classes = [note.pitch % 12 for note in all_notes]
        pitch_class_counts = np.bincount(pitch_classes, minlength=12)
        most_common_pitches = np.argsort(pitch_class_counts)[::-1][:5].tolist()  # Top 5 most common pitches
        
        # Calculate note density over time
        if midi_data.get_end_time() > 0:
            # Divide the track into 16 segments
            resolution = 16
            note_density_over_time = [0] * resolution
            total_duration = midi_data.get_end_time()
            
            for note in all_notes:
                start_segment = min(int((note.start / total_duration) * resolution), resolution - 1)
                end_segment = min(int((note.end / total_duration) * resolution), resolution - 1)
                
                for segment in range(start_segment, end_segment + 1):
                    note_density_over_time[segment] += 1
        else:
            note_density_over_time = [0] * 16
        
        # Detect chords
        # Group notes by start time with small tolerance
        tolerance = 0.05  # 50ms tolerance for chord detection
        notes_by_time = {}
        
        for note in all_notes:
            # Round to nearest tolerance
            time_slot = round(note.start / tolerance) * tolerance
            if time_slot not in notes_by_time:
                notes_by_time[time_slot] = []
            notes_by_time[time_slot].append(note.pitch % 12)  # Store pitch class
        
        # Find chord patterns (time slots with multiple notes)
        chord_patterns = []
        for time_slot, pitches in notes_by_time.items():
            if len(pitches) > 1:  # More than one note played simultaneously
                chord_patterns.append({
                    "time": float(time_slot),
                    "pitches": sorted(list(set(pitches)))  # Remove duplicates and sort
                })
        
        # Build note sequence visualization data
        note_sequence = []
        for note in sorted(all_notes, key=lambda x: x.start):
            note_sequence.append({
                "pitch": note.pitch,
                "pitch_class": note.pitch % 12,
                "start": float(note.start),
                "end": float(note.end),
                "velocity": float(note.velocity)
            })
        
        # Calculate musical features fingerprint
        fingerprint = {
            "type": "midi",
            "note_density": len(all_notes) / midi_data.get_end_time() if midi_data.get_end_time() > 0 else 0,
            "pitch_range": [
                int(min(note.pitch for note in all_notes)), 
                int(max(note.pitch for note in all_notes))
            ],
            "pitch_range_semitones": int(max(note.pitch for note in all_notes) - min(note.pitch for note in all_notes)),
            "average_velocity": float(np.mean([note.velocity for note in all_notes])),
            "duration": float(midi_data.get_end_time()),
            "note_count": len(all_notes),
            "tempo_estimate": float(midi_data.estimate_tempo()) if hasattr(midi_data, "estimate_tempo") else None,
            "most_common_pitches": most_common_pitches,
            "pitch_histogram": calculate_pitch_histogram(all_notes),
            "note_density_over_time": note_density_over_time,
            "chord_patterns": chord_patterns[:10],  # Limit to first 10 chords
            "note_sequence": note_sequence[:100]  # Limit to first 100 notes for visualization
        }
        
        return fingerprint
    except Exception as e:
        return {"error": str(e), "type": "midi"}

def calculate_pitch_histogram(notes, bins=12):
    """Calculate histogram of note pitches, folded to one octave."""
    if not notes:
        return [0] * bins
    
    # Extract pitches and fold to one octave (mod 12)
    pitches = [note.pitch % 12 for note in notes]
    
    # Count occurrences of each pitch class
    histogram = [0] * bins
    for pitch in pitches:
        histogram[pitch] += 1
    
    # Normalize
    total = sum(histogram)
    if total > 0:
        histogram = [float(count / total) for count in histogram]
    
    return histogram

def analyze_element(file_path, output_dir=None):
    """
    Analyze an element file (either audio or MIDI) and return appropriate analysis.
    """
    file_path = str(file_path)  # Convert Path to string if needed
    file_name = os.path.basename(file_path)
    extension = os.path.splitext(file_path)[1].lower()
    
    # Determine file type and use appropriate analysis
    if extension in ['.mid', '.midi']:
        print(f"Analyzing MIDI: {file_name}")
        analysis = analyze_midi_file(file_path)
    elif extension in ['.wav', '.mp3', '.ogg', '.flac']:
        print(f"Analyzing audio: {file_name}")
        analysis = analyze_audio_file(file_path, output_dir)
    else:
        return {"error": f"Unsupported file type: {extension}", "type": "unknown"}
    
    # Add file metadata
    analysis["file_name"] = file_name
    analysis["file_path"] = file_path
    analysis["extension"] = extension
    
    return analysis

def classify_element(file_name, analysis):
    """
    Attempt to classify the element type based on filename and analysis.
    
    Returns one of: "break", "bass", "ambient", "drums", "unknown"
    """
    file_name_lower = file_name.lower()
    
    # Check filename for common types
    if any(term in file_name_lower for term in ['break', 'amen', 'think']):
        return "break"
    elif any(term in file_name_lower for term in ['bass', 'reese', 'foghorn']):
        return "bass"
    elif any(term in file_name_lower for term in ['ambient', 'pad', 'atmos']):
        return "ambient"
    elif any(term in file_name_lower for term in ['drum', 'beat', 'percussion']):
        return "drums"
    
    # If filename doesn't give clues, use analysis
    if analysis["type"] == "audio":
        # For audio files, use spectral characteristics
        if "spectral_centroid_mean" in analysis:
            # Breaks typically have high onset density and spectral variation
            if analysis.get("onset_density", 0) > 1.5:
                return "break"
            # Bass typically has low spectral centroid
            if analysis.get("spectral_centroid_mean", 0) < 2000:
                return "bass"
    
    elif analysis["type"] == "midi":
        # For MIDI files, use pitch and rhythm characteristics
        if "pitch_range" in analysis:
            # Bass typically uses lower pitch range
            if analysis["pitch_range"][1] < 60:
                return "bass"
            # Ambient typically has longer notes and less rhythm variation
            if "note_density" in analysis and analysis["note_density"] < 0.5:
                return "ambient"
    
    return "unknown"

def main():
    # Create directories
    data_dir = Path("../data")
    image_dir = Path("../data/images")
    os.makedirs(data_dir, exist_ok=True)
    os.makedirs(image_dir, exist_ok=True)
    
    # Find all MIDI files
    midi_files = glob.glob("samples/midi/*.mid")
    
    # Find all audio files
    audio_files = (
        glob.glob("samples/*.mp3") + 
        glob.glob("samples/*.wav") + 
        glob.glob("samples/*.ogg") + 
        glob.glob("samples/*.flac")
    )
    
    # All files to analyze
    all_files = midi_files + audio_files
    
    if not all_files:
        print("No MIDI or audio files found in samples directory")
        return
    
    # Analyze each element and store results
    element_analysis = {}
    
    for file_path in all_files:
        file_name = os.path.basename(file_path).split(".")[0]
        print(f"Analyzing {file_name}...")
        
        # Analyze the file
        analysis = analyze_element(file_path, str(image_dir))
        
        # Classify the element type
        element_type = classify_element(file_name, analysis)
        analysis["element_type"] = element_type
        
        # Store analysis
        element_analysis[file_name] = analysis
    
    # Save analysis to JSON
    output_path = data_dir / "element_analysis.json"
    with open(output_path, "w") as f:
        json.dump(element_analysis, f, indent=4)
    
    # Create a simplified version for visualization
    visualization_data = {}
    for name, analysis in element_analysis.items():
        viz_element = {
            "name": name,
            "type": analysis["element_type"],
            "file_type": analysis["type"],
            "duration": analysis.get("duration", 0)
        }
        
        # Add visualization-specific data based on type
        if analysis["type"] == "midi":
            viz_element.update({
                "pitch_histogram": analysis.get("pitch_histogram", []),
                "most_common_pitches": analysis.get("most_common_pitches", []),
                "note_density_over_time": analysis.get("note_density_over_time", [])
            })
        else:  # audio
            viz_element.update({
                "rhythm_pattern": analysis.get("rhythm_pattern", []),
                "waveform_url": f"images/{name}_waveform.png" if analysis.get("has_waveform_image") else None,
                "spectrogram_url": f"images/{name}_spectrogram.png" if analysis.get("has_spectrogram_image") else None
            })
        
        visualization_data[name] = viz_element
    
    # Save visualization data to JSON
    viz_output_path = data_dir / "visualization_data.json"
    with open(viz_output_path, "w") as f:
        json.dump(visualization_data, f, indent=4)
    
    print(f"Analysis complete! Results saved to:")
    print(f"- Full analysis: {output_path}")
    print(f"- Visualization data: {viz_output_path}")
    print(f"- Images: {image_dir}/")

if __name__ == "__main__":
    main()