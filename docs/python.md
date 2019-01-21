# Python / Backend

## Interfaces

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

### Transpiling

To transpile, ensure that `django_typescript` is listed in your projects
apps in `settings.py`. Then, use

```
python manage.py transpile
```


## Model Types

The `ModelType` class is used to specify a Django `Model` that will be
transpiled to a TypeScript representation. It creates the views and url
patterns necessary to excute model logic via TypeScript. The views
correspond to the following actions:

- Get
- Get or create
- Create
- Update
- Delete
- List (and filter)

It takes the following init arguments:

- `model_cls` - The associated Django `Model` class.
- `create_permissions` - An optional tuple of `rest_framework` permission
  classes to assign to the 'create' and 'get or create' view.
- `get_permissions` - An optional tuple of `rest_framework` permission
  classes to assign to the 'get' view.
- `delete_permissions` - An optional tuple of `rest_framework` permission
  classes to assign to the 'delete' view.
- `update_permissions` - An optional tuple of `rest_framework` permission
  classes to assign to the 'get' update

A `ModelType` can be defined in two different ways: 'class-based' and
'inline'. Note that their respective `Interface` assignments are different.
The class-based definition requires using the `ModelType.as_type()`
class method.

### Class Based Definition

All init arguments are passed to the class init arguments.

```python
from django_typescript import interface

from myapp.models import User

class UserModelType(interface.ModelType, model_cls=User):
    pass


class Interface(interface.Interface):
    users = UserModelType.as_type()

```
#### Method

For class-based `ModelType`s, a `ModelType` `method` can be used to
decorate an arbitrary method, whose `self` argument will be passed an
instance of the `Model` associated with the `ModelType`.

#### Methods

Class-based `ModelType`'s can also be provided with 'methods' and 'static
methods'. For a method, the `self` argument will be the associated model
instance. The decorator takes the following arguments:

- `permission_classes` - Optional tuple of permission classes
- `arg_serializer_cls` - Optional REST Framework serializer class that
  will be used to serialize the function input arguments.
- `**field_serializers` - Optional dictionary mapping function input
  argument names to field serializer instances.


```python
from django_typescript import interface

from myapp.models import Thing

class ThingModelType(interface.ModelType, model_cls=User):

    @interface.ModelType.method(a=serializers.CharField(), b=serializers.CharField())
    def thing_method(self: Thing, a, b):
        return {'a': a, 'b': b, 'id': self.pk}

    @interface.ModelType.static_method(a=serializers.CharField(), b=serializers.CharField())
    def thing_static_method(self, a, b):
        return {'a': a, 'b': b}


class Interface(interface.Interface):
    users = UserModelType.as_type()

```


### Inline Definition


```python
from django_typescript import interface

from myapp.models import User

class Interface(interface.Interface):
    users = interface.ModelType(model_cls=User)

```

## Object Types

