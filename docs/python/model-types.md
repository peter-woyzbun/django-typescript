# Model Types

The `ModelType` class is used to specify a Django `Model` that will be
transpiled to a TypeScript representation. It creates the views and url
patterns necessary to excute model logic via TypeScript. The views
correspond to the following actions:

- Get
- Create
- Update
- Delete
- List (and filter)


## Class Based Definition



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