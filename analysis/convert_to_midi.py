import os
from basic_pitch.inference import predict_and_save
from basic_pitch import ICASSP_2022_MODEL_PATH

# List of sample files to process
samples = [
    "amen_break.mp3", 
    "reese_bass.mp3", 
    "reggae_bass_90bpm.mp3",
    "foghorn_car_bass.mp3",
    "175bpm_break.mp3",
    "175bpm_break2.mp3",
    "160bpm_break.mp3",
    "ambient_sample.mp3",
    "think_break_174bpm.mp3"
]

# Create output directory if it doesn't exist
output_dir = "samples/midi"
os.makedirs(output_dir, exist_ok=True)

# Get full paths of existing files
audio_paths = []
for sample in samples:
    input_path = os.path.join("samples", sample)
    
    # Skip if file doesn't exist
    if not os.path.exists(input_path):
        print(f"Skipping {sample} - file not found")
        continue
    
    audio_paths.append(input_path)

if not audio_paths:
    print("No valid audio files found in the samples directory.")
else:
    print(f"Processing {len(audio_paths)} audio files...")
    
    # Convert audio to MIDI and save directly
    predict_and_save(
        audio_path_list=audio_paths,
        output_directory=output_dir,
        save_midi=True,
        sonify_midi=False,
        save_model_outputs=False,
        save_notes=False,
        model_or_model_path=ICASSP_2022_MODEL_PATH  # Use default model
    )
    
    print(f"Conversion complete! MIDI files saved to {output_dir}")