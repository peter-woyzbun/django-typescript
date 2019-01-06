import os
import subprocess
from typing import Type
from distutils.dir_util import copy_tree
from distutils.file_util import copy_file

from django_typescript.core.utils.typescript_template import TypeScriptTemplate
from django_typescript.transpile import templates
from django_typescript.transpile.object_type import ObjectTypeTranspiler
from django_typescript.transpile.model_type import ModelTypeTranspiler
from django_typescript.model_types.model_type import ModelType
from django_typescript.interface import Interface


# =================================
# Transpiler
# ---------------------------------

class Transpiler(object):

    DEST_SOURCE_DIRNAME = 'server'
    MODELS_FILENAME = 'models.ts'
    OBJECTS_FILENAME = 'objects.ts'

    def __init__(self, interface: Type[Interface]):
        self.interface = interface

    def transpile(self):
        self._initialize_destination()
        if self.interface.model_types():
            self._transpile_model_types()
        if self.interface.obj_types():
            self._transpile_object_types()

    @property
    def destination_dir(self):
        return os.path.join(self.interface.TRANSPILE_DEST, self.DEST_SOURCE_DIRNAME)

    def _initialize_destination(self):
        if not os.path.exists(self.destination_dir):
            os.mkdir(self.destination_dir)
        dest_core_dir = os.path.join(self.destination_dir, 'core')
        if not os.path.exists(dest_core_dir):
            os.mkdir(dest_core_dir)
        copy_tree(str(templates.SOURCE_CORE_DIR), dest_core_dir)
        copy_file(str(templates.CLIENT_TEMPLATE_FILE),
                  os.path.join(self.destination_dir, templates.CLIENT_TEMPLATE_FILENAME))
        index_ts = open(os.path.join(self.destination_dir, 'index.ts'), "w+")
        index_ts.close()

    def _try_ts_format(self, filename: str):
        try:
            subprocess.check_call(['tsfmt', '-r', filename], cwd=self.destination_dir)
        except Exception as e:
            print(f"Could not format `{filename}`. Install `typescript-formatter` "
                  "(`npm install -g typescript-formatter`) to enable code formatting.")

    def _transpile_model_types(self):
        model_type_sources = []
        for model_type in self.interface.model_types():
            model_type_transpiler = ModelTypeTranspiler(model_type=model_type, model_pool=self.interface.models())
            model_type_sources.append(model_type_transpiler.transpile())
        models_file = open(os.path.join(self.destination_dir, self.MODELS_FILENAME), "w+")
        models_template = TypeScriptTemplate.open(templates.MODELS_TEMPLATE_FILE)
        source = models_template.render(models="\n".join(model_type_sources))
        models_file.write(source)
        models_file.close()
        self._try_ts_format(self.MODELS_FILENAME)

    def _transpile_object_types(self):
        object_type_sources = []
        for object_type in self.interface.obj_types():
            object_type_transpiler = ObjectTypeTranspiler(object_type=object_type, model_pool=self.interface.models())
            object_type_sources.append(object_type_transpiler.transpile())
        objects_file = open(os.path.join(self.destination_dir, self.OBJECTS_FILENAME), "w+")
        objects_template = TypeScriptTemplate.open(templates.OBJECTS_TEMPLATE_FILE)
        source = objects_template.render(objects="\n".join(object_type_sources))
        objects_file.write(source)
        objects_file.close()
        self._try_ts_format(self.OBJECTS_FILENAME)
