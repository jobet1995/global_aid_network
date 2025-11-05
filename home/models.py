from django.db import models
from wagtail.models import Page
from wagtail.fields import StreamField
from wagtail.admin.panels import FieldPanel
from .blocks import *
from wagtail.snippets.models import register_snippet


@register_snippet
class Statistic(models.Model):
    icon_name = models.CharField(max_length=255, choices = [
        ('users', 'Users'),
        ('heart', 'Heart'),
        ('trending_up', 'Trending Up'),
        ('hand_heart', 'Hand Heart'),
    ])
    value = models.CharField(max_length=255)
    label = models.CharField(max_length=255)

    panels = [
        FieldPanel('icon_name'),
        FieldPanel('value'),
        FieldPanel('label'),
    ]

    def __str__(self):
        return f"{self.label}:{self.value}"

@register_snippet
class News(models.Model):
    title = models.CharField(max_length=255)
    date = models.DateField()
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
    )
    excerpt = models.TextField()
    link_url = models.URLField(blank=True)

    panels = [
        FieldPanel('title'),
        FieldPanel('date'),
        FieldPanel('image'),
        FieldPanel('excerpt'),
        FieldPanel('link_url'),
    ]

    def __str__(self):
        return f"{self.title}"

@register_snippet
class Testimonials(models.Model):
    quote = models.TextField()
    name = models.CharField(max_length=255)
    role = models.CharField(max_length=255, blank=True)
    image = models.ForeignKey(
        'wagtailimages.Image',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+',
    )

    panels = [
        FieldPanel('quote'),
        FieldPanel('name'),
        FieldPanel('role'),
        FieldPanel('image'),
    ]

    def __str__(self):
        return f"{self.name}"


class HomePage(Page):
    """
    Homepage for Global Aid Network
    Uses StreamField for Hero and CTA, and snippets for Stats, News, Testimonials
    """
    body = StreamField(
        [
            ('hero', HeroBlock()),
            ('statistic', StatisticBlock()),
            ('news', NewsBlock()),
            ('testimonial', TestimonialBlock()),
            ('cta', CTAButtonBlock()),
        ],
        null=True,
        blank=True,
        use_json_field=True
    )

    content_panels = Page.content_panels + [
        FieldPanel('body'),
    ]