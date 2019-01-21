import pathlib

from django_typescript import interface

from .models import User, Poll, Question, QuestionComment, Choice


# =================================
# Transpile Destination
# ---------------------------------

TS_TRANSPILE_DEST = str(pathlib.Path(__file__).parent.parent / 'ts')


# =================================
# Interface
# ---------------------------------

class Interface(interface.Interface, transpile_dest=TS_TRANSPILE_DEST):
    users = interface.ModelType(model_cls=User)
    polls = interface.ModelType(model_cls=Poll)
    questions = interface.ModelType(model_cls=Question)
    question_comments = interface.ModelType(model_cls=QuestionComment)
    question_choices = interface.ModelType(model_cls=Choice)

