import pathlib


# =================================
# File names
# ---------------------------------

MODEL_TYPE_TEMPLATE_FILENAME = 'model_type.tpl.ts'
OBJECT_TYPE_TEMPLATE_FILENAME = 'object_type.tpl.ts'
CLIENT_TEMPLATE_FILENAME = 'client.ts'
MODELS_TEMPLATE_FILENAME = 'models.tpl.ts'
OBJECTS_TEMPLATE_FILENAME = 'objects.tpl.ts'

# =================================
# Directories
# ---------------------------------

# Path to directory containing source templates.
SOURCE_TEMPLATE_DIR = pathlib.Path(__file__).parent / 'src_template'

# Path directory containing core source code.
SOURCE_CORE_DIR = SOURCE_TEMPLATE_DIR / 'core'


# =================================
# File Paths
# ---------------------------------

MODEL_TYPE_TEMPLATE_FILE = SOURCE_TEMPLATE_DIR / MODEL_TYPE_TEMPLATE_FILENAME
OBJECT_TYPE_TEMPLATE_FILE = SOURCE_TEMPLATE_DIR / OBJECT_TYPE_TEMPLATE_FILENAME
MODELS_TEMPLATE_FILE = SOURCE_TEMPLATE_DIR / MODELS_TEMPLATE_FILENAME
OBJECTS_TEMPLATE_FILE = SOURCE_TEMPLATE_DIR / OBJECTS_TEMPLATE_FILENAME
CLIENT_TEMPLATE_FILE = SOURCE_TEMPLATE_DIR / CLIENT_TEMPLATE_FILENAME


