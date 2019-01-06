import typing
import re

from django.db import models
from rest_framework import serializers
from django.urls import path

from django_typescript.core.model_inspector import ModelInspector
from django_typescript.model_types.field import ModelTypeField
from django_typescript.core import types
from django_typescript.model_types.lookup_tree import LookupTree
from django_typescript.model_types.views import (CreateView,
                                                 DeleteView,
                                                 GetView,
                                                 ListView,
                                                 ModelMethodView,
                                                 ModelStaticMethodView,
                                                 UpdateView)


# =================================
# Interface Model Type
# ---------------------------------

class ModelType(object):

    """
    A `ModelType` ...

    """

    _MODEL_CLS: types.ModelClass = None

    _LOOKUP_TREE: types.PermissionClasses = None
    _RELATION_POOL: types.ModelPool = None
    _CREATE_PERMISSIONS: types.PermissionClasses = None
    _GET_PERMISSIONS: types.PermissionClasses = None
    _DELETE_PERMISSIONS: types.PermissionClasses = None
    _UPDATE_PERMISSIONS: types.PermissionClasses = None

    def __init__(self, model_cls: typing.Type[models.Model],
                 lookup_tree: LookupTree = None, create_permissions: types.PermissionClasses = None,
                 get_permissions: types.PermissionClasses = None, delete_permissions: types.PermissionClasses = None,
                 update_permissions: types.PermissionClasses = None):

        """

        Parameters
        ----------
        model_cls: The django `Model` class this `ModelType` represents.
        lookup_tree
        create_permissions
        get_permissions
        delete_permissions
        update_permissions
        """

        self.model_cls = model_cls
        self.model_inspector = ModelInspector(model_cls=model_cls)
        self.lookup_tree = lookup_tree if lookup_tree is not None else LookupTree(tree=[])
        self.forward_relation_fields: typing.List[ModelTypeField] = []
        self.reverse_relation_fields: typing.List[ModelTypeField] = []
        self.concrete_fields: typing.List[ModelTypeField] = []
        self.field_map: typing.Dict[str, ModelTypeField] = {}
        self.serializer_cls: types.ModelSerializerClass = None

        self._initialize()

        self.create_view = CreateView(serializer_cls=self.serializer_cls, permission_classes=create_permissions)
        self.delete_view = DeleteView(serializer_cls=self.serializer_cls, permission_classes=delete_permissions)
        self.get_view = GetView(serializer_cls=self.serializer_cls, permission_classes=get_permissions)
        self.list_view = ListView(serializer_cls=self.serializer_cls, permission_classes=get_permissions)
        self.update_view = UpdateView(serializer_cls=self.serializer_cls, permission_classes=update_permissions)

    def __init_subclass__(cls, **kwargs):
        model_cls = kwargs.get('model_cls', None)
        if model_cls is None:
            raise AssertionError("No `model_cls` provided in `ModelType` class-init keyword arguments.")
        lookup_tree = kwargs.get('lookup_tree')
        create_permissions = kwargs.get('create_permissions')
        get_permissions = kwargs.get('get_permissions')
        delete_permissions = kwargs.get('delete_permissions')
        update_permissions = kwargs.get('update_permissions')
        cls._MODEL_CLS = model_cls
        cls._LOOKUP_TREE = lookup_tree
        cls._CREATE_PERMISSIONS = create_permissions
        cls._GET_PERMISSIONS = get_permissions
        cls._DELETE_PERMISSIONS = delete_permissions
        cls._UPDATE_PERMISSIONS = update_permissions

    @classmethod
    def as_type(cls) -> 'ModelType':
        type_ = cls(model_cls=cls._MODEL_CLS, lookup_tree=cls._LOOKUP_TREE,
                    create_permissions=cls._CREATE_PERMISSIONS, get_permissions=cls._GET_PERMISSIONS,
                    delete_permissions=cls._DELETE_PERMISSIONS, update_permissions=cls._UPDATE_PERMISSIONS)
        return type_

    @property
    def model_fields(self) -> typing.List[types.ModelField]:
        return self.model_cls._meta.get_fields()

    def _initialize(self):
        self._create_relation_fields()
        self._make_serializer_cls()
        self._create_concrete_fields()
        self._create_field_map()

    def _create_relation_fields(self):
        for model_field in self.model_inspector.forward_relation_fields:
            self.forward_relation_fields.append(ModelTypeField.for_relation(model_field=model_field))
        for model_field in self.model_inspector.reverse_relation_fields:
            self.reverse_relation_fields.append(ModelTypeField.for_relation(model_field=model_field))

    def _make_serializer_cls(self):
        """
        Build the DRF `ModelSerializer` class for this `ModelType`.

        Returns
        -------

        """
        field_names = [f.name for f in self.model_inspector.concrete_fields] + \
                      [f.name for f in self.forward_relation_fields]



        class BaseSerializer(serializers.ModelSerializer):
            """
            This is used to auto-generate the 'concrete' fields for this
            `ModelType`'s `model_cls`.

            """

            def validate(_self, attrs):
                validate_model_type = getattr(self, "validate", None)

                if validate_model_type:
                    validate_model_type(**dict(attrs))
                return serializers.ModelSerializer.validate(_self, attrs)

            class Meta:
                model = self.model_cls
                fields = field_names

        # The base serializer is sub-classed in order to replace any auto-generated
        # forward relation field serializers with the appropriate serializer field.
        # The default behaviour of DRF for a foreign key or one-to-one field is to
        # create a readonly field for `<fk_field_name>_id` (if given in `Meta.fields`).
        forward_relation_field_serializers = {
            f.name: f.serializer_field for f in self.forward_relation_fields
        }
        serializer_cls = type("ArgSerializer", (BaseSerializer,), forward_relation_field_serializers)
        self.serializer_cls = serializer_cls

    def _create_concrete_fields(self):
        serializer_fields = self.serializer_cls().get_fields()
        for model_field in self.model_inspector.concrete_fields:
            self.concrete_fields.append(
                ModelTypeField(model_field=model_field, serializer_field=serializer_fields[model_field.name])
            )

    def _create_field_map(self):
        for field in self.fields:
            self.field_map[field.name] = field

    @property
    def method_views(self):
        method_views = []
        for k, v in self.__class__.__dict__.items():
            if isinstance(v, ModelMethodView):
                method_views.append(v)
        return method_views

    @property
    def static_method_views(self):
        static_method_views = []
        for k, v in self.__class__.__dict__.items():
            if isinstance(v, ModelStaticMethodView):
                static_method_views.append(v)
        return static_method_views

    @classmethod
    def method(cls, permission_classes=None, arg_serializer_cls: typing.Type[serializers.Serializer] = None,
               **serializer_fields: serializers.Field):
        """
        Register Type `Method`...

        """

        def decorator(func):
            method = ModelMethodView(func=func, permission_classes=permission_classes,
                                     arg_serializer_cls=arg_serializer_cls, **serializer_fields)
            return method

        return decorator

    @classmethod
    def static_method(cls, permission_classes=None, arg_serializer_cls: typing.Type[serializers.Serializer] = None,
                      **serializer_fields: serializers.Field):
        """
        Register Type `Method`...

        """
        def decorator(func):
            static_method = ModelStaticMethodView(func=func, permission_classes=permission_classes,
                                                  arg_serializer_cls=arg_serializer_cls, **serializer_fields)
            return static_method

        return decorator

    def urlpatterns(self):
        """
        Return the Django URL patterns for this ModelType.

        :return:
        """
        urlpatterns = [
            path(self.create_view.url_path, self.create_view.view(), name='create'),
            path(self.delete_view.url_path, self.delete_view.view(), name='delete'),
            path(self.get_view.url_path, self.get_view.view(), name='get'),
            path(self.list_view.url_path, self.list_view.view(), name='list'),
            path(self.update_view.url_path, self.update_view.view(), name='update'),
        ]
        for method_view in self.method_views:
            # Pass the method view this ModelType's serializer class.
            method_view.model_serializer_cls = self.serializer_cls
            urlpatterns.append(
                path(method_view.url_path, method_view.view(), name=method_view.name),
            )
        for static_method_view in self.static_method_views:
            static_method_view.model_type_cls = self.__class__
            urlpatterns.append(
                path(static_method_view.url_path, static_method_view.view(), name=static_method_view.name),
            )
        return urlpatterns

    @property
    def model_name(self):
        return self.model_cls.__name__

    def base_url(self):
        """
        Return the 'base url' for this interface `Type`. For a model `CamelCase`,
        this will return `camel-case`.

        """
        matches = re.finditer('.+?(?:(?<=[a-z])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])|$)', self.model_name)
        return "-".join([m.group(0).lower() for m in matches])

    @property
    def fields(self) -> typing.List[ModelTypeField]:
        return self.concrete_fields + self.forward_relation_fields + self.reverse_relation_fields

    def field_lookup_info(self, model_pool: types.ModelPool) -> typing.List[types.FieldLookupInfo]:
        lookup_info = []
        for field in self.fields:
            lookup_info += field.lookup_info(model_pool=model_pool)
        return lookup_info




