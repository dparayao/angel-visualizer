import inspect
from basic_pitch.inference import predict_and_save

# Get the function signature
signature = inspect.signature(predict_and_save)

# Print parameter names and default values
print("Parameters for predict_and_save:")
for param_name, param in signature.parameters.items():
    print(f"- {param_name}: {param.default if param.default is not inspect.Parameter.empty else 'required'}")