import matplotlib.pyplot as plt
import numpy as np
import json
import os
from pathlib import Path
import librosa
import librosa.display

# Custom JSON encoder to handle NumPy types
class NumpyEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.integer):
            return int(obj)
        elif isinstance(obj, np.floating):
            return float(obj)
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        return super(NumpyEncoder, self).default(obj)

def generate_break_visualization(audio_file, output_dir):
    """
    Generate specialized visualizations for break samples
    """
    try:
        # Load the audio file
        y, sr = librosa.load(audio_file, sr=None)
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Extract file name without extension
        file_name = os.path.basename(audio_file).split('.')[0]
        
        # 1. Create enhanced waveform with onset markers
        plt.figure(figsize=(10, 4))
        
        # Plot waveform
        plt.subplot(2, 1, 1)
        librosa.display.waveshow(y, sr=sr)
        plt.title(f"Waveform with Onsets: {file_name}")
        
        # Calculate onsets and mark them
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr)
        
        # Plot onset markers
        for onset_time in onset_times:
            plt.axvline(x=onset_time, color='r', alpha=0.7, linestyle='--')
        
        # 2. Create onset strength plot (useful for visualizing rhythm)
        plt.subplot(2, 1, 2)
        frames = range(len(onset_env))
        t = librosa.frames_to_time(frames, sr=sr)
        plt.plot(t, onset_env)
        plt.title("Onset Strength")
        plt.xlabel("Time (s)")
        plt.tight_layout()
        
        # Save combined plot
        plt.savefig(f"{output_dir}/{file_name}_break_analysis.png", dpi=150)
        plt.close()
        
        # 3. Create rhythmic pattern visualization
        # Create a time grid visualization based on onset strength
        plt.figure(figsize=(12, 3))
        
        # Divide into 16 or 32 segments (common for break patterns)
        segments = 16
        duration = librosa.get_duration(y=y, sr=sr)
        segment_duration = duration / segments
        
        # Calculate average onset strength for each segment
        segment_strengths = []
        for i in range(segments):
            start_time = i * segment_duration
            end_time = (i + 1) * segment_duration
            
            # Find frames corresponding to this time segment
            start_frame = librosa.time_to_frames(start_time, sr=sr)
            end_frame = librosa.time_to_frames(end_time, sr=sr)
            
            # Ensure valid indices
            start_frame = max(0, min(start_frame, len(onset_env) - 1))
            end_frame = max(0, min(end_frame, len(onset_env) - 1))
            
            # Calculate average onset strength for this segment
            if start_frame < end_frame:
                segment_strength = np.mean(onset_env[start_frame:end_frame])
            else:
                segment_strength = onset_env[start_frame] if start_frame < len(onset_env) else 0
                
            segment_strengths.append(float(segment_strength))  # Convert to native Python float
        
        # Normalize segment strengths
        if max(segment_strengths) > 0:
            segment_strengths = [float(s / max(segment_strengths)) for s in segment_strengths]
        
        # Create grid visualization
        for i, strength in enumerate(segment_strengths):
            # Color based on strength (white to red)
            color = (1, 1-strength, 1-strength)  # RGB: white to red
            plt.axvspan(i, i+0.9, alpha=0.8, color=color)
            
            # Add text labels for stronger beats
            if strength > 0.5:
                plt.text(i+0.45, 0.5, f"{i+1}", ha='center', va='center', 
                         fontsize=12, fontweight='bold', color='black')
        
        plt.ylim(0, 1)
        plt.xlim(0, segments)
        plt.title(f"Rhythmic Pattern: {file_name}")
        plt.xticks(np.arange(0.5, segments, 1), [f"{i+1}" for i in range(segments)])
        plt.yticks([])
        plt.grid(False)
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_rhythm_grid.png", dpi=150)
        plt.close()
        
        # 4. Create mel spectrogram for texture visualization
        plt.figure(figsize=(10, 6))
        mel_spec = librosa.feature.melspectrogram(y=y, sr=sr, n_mels=128)
        mel_spec_db = librosa.power_to_db(mel_spec, ref=np.max)
        
        img = librosa.display.specshow(mel_spec_db, sr=sr, x_axis='time', y_axis='mel', 
                                     cmap='viridis')
        plt.colorbar(img, format="%+2.f dB")
        plt.title(f"Mel Spectrogram: {file_name}")
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_mel_spectrogram.png", dpi=150)
        plt.close()
        
        return {
            "rhythm_grid": f"{file_name}_rhythm_grid.png",
            "break_analysis": f"{file_name}_break_analysis.png",
            "mel_spectrogram": f"{file_name}_mel_spectrogram.png",
            "segment_strengths": segment_strengths,
            "onset_times": [float(t) for t in onset_times.tolist()],  # Convert to native Python float
            "duration": float(duration)  # Convert to native Python float
        }
        
    except Exception as e:
        print(f"Error generating break visualization for {audio_file}: {e}")
        return {"error": str(e)}

def generate_bass_visualization(audio_file, output_dir):
    """
    Generate specialized visualizations for bass samples
    """
    try:
        # Load the audio file
        y, sr = librosa.load(audio_file, sr=None)
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Extract file name without extension
        file_name = os.path.basename(audio_file).split('.')[0]
        
        # 1. Create waveform with envelope
        plt.figure(figsize=(10, 4))
        
        # Plot waveform
        plt.subplot(2, 1, 1)
        times = np.linspace(0, len(y)/sr, len(y))
        plt.plot(times, y)
        plt.title(f"Waveform: {file_name}")
        
        # Plot envelope
        plt.subplot(2, 1, 2)
        y_env = np.abs(y)
        y_env_smooth = librosa.util.normalize(
            np.convolve(y_env, np.ones(int(sr/10))/int(sr/10), mode='same')
        )
        plt.plot(times, y_env_smooth)
        plt.title("Amplitude Envelope")
        plt.xlabel("Time (s)")
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_bass_envelope.png", dpi=150)
        plt.close()
        
        # 2. Create low frequency spectrogram (focused on bass range)
        plt.figure(figsize=(10, 6))
        D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)
        
        # Focus on bass frequencies (up to 250 Hz)
        max_freq_idx = int(250 * D.shape[0] / (sr/2))
        bass_spec = D[:max_freq_idx, :]
        
        img = librosa.display.specshow(bass_spec, sr=sr, x_axis='time', y_axis='linear',
                                     cmap='magma')
        plt.colorbar(img, format="%+2.f dB")
        plt.title(f"Bass Frequency Spectrogram (0-250Hz): {file_name}")
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_bass_spectrogram.png", dpi=150)
        plt.close()
        
        # 3. Extract fundamental frequency contour
        plt.figure(figsize=(10, 4))
        
        # Extract pitch using YIN algorithm
        pitches, magnitudes = librosa.core.piptrack(y=y, sr=sr, fmin=30, fmax=300)
        
        # Get the most prominent pitch at each frame
        pitch_contour = []
        times = librosa.times_like(pitches[0])
        
        for t, mag in zip(range(magnitudes.shape[1]), magnitudes.T):
            index = mag.argmax()
            pitch = pitches[index, t]
            pitch_contour.append(float(pitch) if pitch > 0 else np.nan)
        
        # Plot pitch contour
        plt.plot(times, pitch_contour)
        plt.ylim(30, 300)
        plt.title(f"Fundamental Frequency Contour: {file_name}")
        plt.xlabel("Time (s)")
        plt.ylabel("Frequency (Hz)")
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_pitch_contour.png", dpi=150)
        plt.close()
        
        # Calculate bass movement pattern (for visualization)
        # Take every n points from the pitch contour
        n = max(1, len(pitch_contour) // 16)
        bass_movement = [p for i, p in enumerate(pitch_contour) if i % n == 0][:16]
        
        # Replace NaN values with 0
        bass_movement = [0 if np.isnan(p) else float(p) for p in bass_movement]
        
        return {
            "bass_envelope": f"{file_name}_bass_envelope.png",
            "bass_spectrogram": f"{file_name}_bass_spectrogram.png",
            "pitch_contour": f"{file_name}_pitch_contour.png",
            "bass_movement": bass_movement,
            "duration": float(len(y)/sr)
        }
        
    except Exception as e:
        print(f"Error generating bass visualization for {audio_file}: {e}")
        return {"error": str(e)}

def generate_midi_note_visualization(midi_file, output_dir):
    """
    Generate piano roll visualization for MIDI files
    """
    try:
        import pretty_midi
        
        # Load MIDI file
        midi_data = pretty_midi.PrettyMIDI(midi_file)
        
        # Create output directory
        os.makedirs(output_dir, exist_ok=True)
        
        # Extract file name without extension
        file_name = os.path.basename(midi_file).split('.')[0]
        
        # Check if there are any instruments or if they're empty
        if not midi_data.instruments or not any(len(instrument.notes) > 0 for instrument in midi_data.instruments):
            print(f"Warning: No notes found in {file_name}")
            return {
                "error": "No notes found in MIDI file",
                "file_name": file_name,
                "type": "midi"
            }
        
        # Piano roll visualization
        plt.figure(figsize=(12, 6))
        
        # Get non-empty instruments
        non_empty_instruments = [inst for inst in midi_data.instruments if len(inst.notes) > 0]
        
        if not non_empty_instruments:
            print(f"Warning: All instruments empty in {file_name}")
            return {
                "error": "No notes found in any instrument",
                "file_name": file_name,
                "type": "midi"
            }
        
        # Check if there's a valid end time
        total_duration = midi_data.get_end_time()
        if total_duration <= 0:
            print(f"Warning: Invalid duration in {file_name}")
            return {
                "error": "Invalid MIDI duration",
                "file_name": file_name,
                "type": "midi"
            }
        
        # Plot piano roll for each non-empty instrument
        for i, instrument in enumerate(non_empty_instruments):
            # Get piano roll
            fs = 100  # sampling frequency (Hz)
            piano_roll = instrument.get_piano_roll(fs=fs)
            
            # Plot as image
            plt.subplot(len(non_empty_instruments), 1, i+1)
            plt.imshow(piano_roll, aspect='auto', origin='lower', 
                      extent=[0, total_duration, 0, 128],
                      cmap='Blues')
            
            plt.ylabel('Pitch')
            plt.title(f"Instrument {i+1}: {instrument.name if instrument.name else 'Unnamed'}")
            
        plt.xlabel('Time (s)')
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_piano_roll.png", dpi=150)
        plt.close()
        
        # Extract all notes from all instruments
        all_notes = []
        for instrument in midi_data.instruments:
            all_notes.extend(instrument.notes)
        
        # If no notes, return early
        if not all_notes:
            return {
                "error": "No notes found",
                "file_name": file_name,
                "piano_roll": f"{file_name}_piano_roll.png",
                "type": "midi"
            }
        
        # Create pitch class histogram
        pitch_classes = [note.pitch % 12 for note in all_notes]
        plt.figure(figsize=(8, 4))
        
        # Plot histogram
        pitch_names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        pitch_counts = np.bincount(pitch_classes, minlength=12)
        
        plt.bar(range(12), pitch_counts, color='steelblue')
        plt.xticks(range(12), pitch_names)
        plt.title(f"Pitch Class Distribution: {file_name}")
        plt.ylabel("Count")
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_pitch_histogram.png", dpi=150)
        plt.close()
        
        # Extract top 5 most common pitches
        top_pitches = np.argsort(pitch_counts)[::-1][:5].tolist()
        
        # Create rhythm pattern visualization
        # Divide the track into 16 segments
        resolution = 16
        note_density_over_time = [0] * resolution
        
        for note in all_notes:
            start_segment = min(int((note.start / total_duration) * resolution), resolution - 1)
            end_segment = min(int((note.end / total_duration) * resolution), resolution - 1)
            
            for segment in range(start_segment, end_segment + 1):
                note_density_over_time[segment] += 1
        
        # Normalize
        max_density = max(note_density_over_time) if note_density_over_time else 1
        normalized_density = [float(d / max_density) for d in note_density_over_time]
        
        # Create grid visualization
        plt.figure(figsize=(12, 3))
        for i, density in enumerate(normalized_density):
            # Color based on density (white to blue)
            color = (1-density, 1-density, 1)  # RGB: white to blue
            plt.axvspan(i, i+0.9, alpha=0.8, color=color)
            
            # Add text labels for stronger beats
            if density > 0.5:
                plt.text(i+0.45, 0.5, f"{i+1}", ha='center', va='center', 
                         fontsize=12, fontweight='bold', color='black')
        
        plt.ylim(0, 1)
        plt.xlim(0, resolution)
        plt.title(f"MIDI Note Density Pattern: {file_name}")
        plt.xticks(np.arange(0.5, resolution, 1), [f"{i+1}" for i in range(resolution)])
        plt.yticks([])
        plt.grid(False)
        plt.tight_layout()
        
        plt.savefig(f"{output_dir}/{file_name}_midi_rhythm.png", dpi=150)
        plt.close()
        
        return {
            "piano_roll": f"{file_name}_piano_roll.png",
            "pitch_histogram": f"{file_name}_pitch_histogram.png",
            "midi_rhythm": f"{file_name}_midi_rhythm.png",
            "top_pitches": top_pitches,
            "normalized_density": normalized_density,
            "duration": float(total_duration)
        }
        
    except Exception as e:
        print(f"Error generating MIDI visualization for {midi_file}: {e}")
        return {"error": str(e)}

def main():
    """
    Generate visualizations for all samples
    """
    # Find all audio and MIDI files
    audio_files = []
    for ext in ['.mp3', '.wav', '.ogg', '.flac']:
        audio_files.extend(list(Path('samples').glob(f'*{ext}')))
    
    midi_files = list(Path('samples/midi').glob('*.mid'))
    
    # Create output directory
    output_dir = Path('../data/visualizations')
    os.makedirs(output_dir, exist_ok=True)
    
    # Results storage
    visualization_data = {}
    
    # Process break and bass audio files
    for audio_file in audio_files:
        file_name = audio_file.stem
        print(f"Generating visualizations for {file_name}...")
        
        # Classify the element type based on filename
        file_name_lower = file_name.lower()
        
        if any(term in file_name_lower for term in ['break', 'amen', 'think']):
            # Generate break visualizations
            result = generate_break_visualization(str(audio_file), str(output_dir))
            result['type'] = 'break'
            visualization_data[file_name] = result
            
        elif any(term in file_name_lower for term in ['bass', 'reese', 'foghorn']):
            # Generate bass visualizations
            result = generate_bass_visualization(str(audio_file), str(output_dir))
            result['type'] = 'bass'
            visualization_data[file_name] = result
            
        else:
            # Generic audio visualization (use break visualization for now)
            result = generate_break_visualization(str(audio_file), str(output_dir))
            result['type'] = 'other'
            visualization_data[file_name] = result
    
    # Process MIDI files
    for midi_file in midi_files:
        file_name = midi_file.stem
        print(f"Generating visualizations for MIDI {file_name}...")
        
        result = generate_midi_note_visualization(str(midi_file), str(output_dir))
        
        # Try to classify based on filename
        file_name_lower = file_name.lower()
        if any(term in file_name_lower for term in ['bass', 'reese', 'foghorn']):
            result['type'] = 'bass'
        elif any(term in file_name_lower for term in ['ambient', 'pad']):
            result['type'] = 'ambient'
        else:
            result['type'] = 'midi'
            
        visualization_data[file_name] = result
    
    # Save visualization data to JSON with the custom encoder
    with open(output_dir / 'visualization_metadata.json', 'w') as f:
        json.dump(visualization_data, f, cls=NumpyEncoder, indent=4)
    
    print(f"Visualization generation complete! Results saved to {output_dir}")

if __name__ == "__main__":
    main()