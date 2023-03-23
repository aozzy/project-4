from app import app
from flask import request
from functools import wraps
def logging(route_func):
    
    # always add this line two prevent your decoreated function using the same name for multiple routes
    @wraps(route_func)
    
    def wrapper(*args,**kwargs):
      print(' 🖥  logging ')    
      print(f'JSON Body:{request.json}') 
      print(f'JSON Headers:{request.headers}') 
      print(f'Thanks')
    
      return route_func(*args,**kwargs)

    return wrapper
