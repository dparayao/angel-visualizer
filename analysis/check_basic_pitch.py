import basic_pitch
import inspect

# Print basic_pitch module structure
print("Basic Pitch module structure:")
print(dir(basic_pitch))

# Try to access the inference module
print("\nInference module:")
try:
    import basic_pitch.inference
    print(dir(basic_pitch.inference))
except ImportError as e:
    print(f"Error: {e}")

# Check all available modules
print("\nAll modules in basic_pitch:")
for name, obj in inspect.getmembers(basic_pitch):
    if inspect.ismodule(obj):
        print(f"- {name}")