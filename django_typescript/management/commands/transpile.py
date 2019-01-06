from typing import Type
import subprocess
import importlib

from django.core.management.base import BaseCommand

from django_typescript import config
from django_typescript.core.exceptions import TranspileError
from django_typescript.interface import Interface
from django_typescript.transpile import Transpiler


# =================================
# Transpile Command
# ---------------------------------

class Command(BaseCommand):

    help = 'Transpile `django-ts` Interface into TypeScript code.'

    def handle(self, *args, **options):
        interface_path = config.INTERFACE_PATH
        self.stdout.write(f"Attempting to transpile.")
        module = importlib.import_module(interface_path)
        if not hasattr(module, 'Interface'):
            raise TranspileError("Could not find `Interface` class in module `{path}`".format(path=interface_path))
        InterfaceCls: Type[Interface] = getattr(module, 'Interface')
        transpiler = Transpiler(interface=InterfaceCls)
        transpiler.transpile()
        self.stdout.write("Transpile successful.")
