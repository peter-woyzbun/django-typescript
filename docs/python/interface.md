# Interfaces

The `Interface` defines what `ModelType`'s and `ObjectType`'s will be
exposed on the TypeScript side. Two things are mandatory:

1. The subclass of `interface.Interface` is also called `Interface`
2. A `transpile_dest` keyword argument must be supplied to the subclasses
    class init arguments. This tells the transpiler where the transpiled
    code should go.


```
from django_typescript import interface
from .models import SomeModel

class Interface(interface.Interface, transpile_dest='src/...'):
    some_model = interface.ModelType(model_cls=SomeModel)

```