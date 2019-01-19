# django-typescript

`django-typescript` takes the models of a Django project and generates
TypeScript code for interacting with them. The generated code essentially
provide classes that closely resemble their Django/Python counterparts.

### In Python/Django

```python
from django.db import models
from django.contrib.auth.models import User


class Poll(models.Model):
    POLL_STATE_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
        ('PAUSED', 'Paused'),
    )
    name = models.CharField(max_length=200)
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

```


### In TypeScript

```typescript
import {User, Poll, Question, QuestionComment} from './server/models'


const [user] = await User.objects.get(1)

const [polls]: Poll[] = await user.polls()

const [filteredPolls] = await user.polls({name__startswith: 'prefix'})

const [newPoll, validationErrors] = Poll.objects.create({user_id: user.pk(), name: 'Poll name'})

if (newPoll){
    // There were no validation errors.
} else {
    // Do something with validation errors.
}

// This will cause a type error, because 'INVALID_STATE' is not a possible choice.
const [invalidPoll] = Poll.objects.create({user_id: user.pk(), name: 'Poll 2 name', state: 'INVALID_STATE'})

let [pollQuestion] = Question.objects.create({poll_id: newPoll.pk(), question_text: 'Some text'})

// Get the associated Poll instance asynchronously.
let [questionPoll] = await pollQuestion.poll

// Prefetch the associated Poll instance.
let [pollQuestion] = Question.objects.get(pollQuestion.pk(), 'poll')

let [questionPoll] = pollQuestion.poll

```



## Table of Contents

- [Use Cases](#use-cases)
- [Features/Advantages](#features-advantages)

## Use Cases

`django-typescript` is useful when you have (or need) a Django backend
and some sort of frontend web interface for user interaction. A React
app with a Django REST Framework API backend, for example.

## Features/Advantages

- Get/create/get-or-create/update/delete/filter(and exclude, union)
  Django model data via TypeScript, without writing any views
- Queryset 'lookups' (/filters) are typed, including for forward and
  reverse relations
- Get paginated queryset results
- Automatic retrieval of forward relations (i.e one-to-one and foreign
  key fields)
- On demand, typed (including nested), prefetching of forward relations
- Easily retrieve and filter reverse relations
- The TypeScript model fields are typed
- Every model field has a 'schema' generated, with field types, defaults,
  choices, etc, for use in automated form generation.
- Keep your frontend in-sync with your backend:
    - Changes to models on the backend will result in compile errors
    on the frontend if references are not updated
