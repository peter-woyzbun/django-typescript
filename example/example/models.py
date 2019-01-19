from django.db import models
from django.contrib.auth.models import User


class Poll(models.Model):
    POLL_STATE_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('PAUSED', 'Paused'),
    )

    owner = models.ForeignKey(User, related_name='polls', on_delete=models.CASCADE)
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')
    state = models.CharField(max_length=20, choices=POLL_STATE_CHOICES)


class Question(models.Model):
    poll = models.ForeignKey(Poll, related_name='questions', on_delete=models.CASCADE)
    question_text = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')


class QuestionComment(models.Model):
    question = models.ForeignKey(Question, related_name='comments', on_delete=models.CASCADE)
    comment = models.CharField(max_length=1000)
    user = models.ForeignKey(User, related_name='question_comments', on_delete=models.CASCADE)


class Choice(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name='choices')
    choice_text = models.CharField(max_length=200)
    votes = models.IntegerField(default=0)