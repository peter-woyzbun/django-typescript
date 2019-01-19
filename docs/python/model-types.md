# Model Types

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

## Class Based Definition

All init arguments are passed to the class init arguments.

```python
from django_typescript import interface

from myapp.models import User

class UserModelType(interface.ModelType, model_cls=User):
    pass


class Interface(interface.Interface):
    users = UserModelType.as_type()

```



## Inline Definition


```python
from django_typescript import interface

from myapp.models import User

class Interface(interface.Interface):
    users = interface.ModelType(model_cls=User)

```