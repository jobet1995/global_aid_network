from wagtail import blocks
from wagtail.images.blocks import ImageChooserBlock

class HeroBlock(blocks.StructBlock):
    title = blocks.CharBlock(required=True, max_length=250, help_text="Main headline")
    subtitle = blocks.TextBlock(required=False, help_text="Supporting subtitle")
    background_image = ImageChooserBlock(required=True)
    cta_primary_text = blocks.CharBlock(required=True, max_length=50)
    cta_primary_url = blocks.URLBlock(required=True)
    cta_secondary_text = blocks.CharBlock(required=False, max_length=50)
    cta_secondary_url = blocks.URLBlock(required=False)

    class Meta:
        template = "blocks/hero_block.html"
        icon = "image"
        label = "Hero Section"

class StatisticBlock(blocks.StructBlock):
    icon_name = blocks.ChoiceBlock(
        choices=[
            ('users', 'Users'),
            ('heart', 'Heart'),
            ('trending_up', 'Trending Up'),
            ('hand_heart', 'Hand Heart'),
        ],
        required=True,
        help_text="Select an icon to display"
    )
    value = blocks.CharBlock(required=True, max_length=50)
    label = blocks.CharBlock(required=True, max_length=150)

    class Meta:
        template = "blocks/statistic_block.html"
        icon = "placeholder"
        label = "Statistic Item"


class NewsBlock(blocks.StructBlock):
    title = blocks.CharBlock(required=True, max_length=250)
    date = blocks.DateBlock(required=True)
    image = ImageChooserBlock(required=True)
    excerpt = blocks.TextBlock(required=True, max_length=500)
    link_url = blocks.URLBlock(required=False)

    class Meta:
        template = "blocks/news_block.html"
        icon = "doc-full"
        label = "News / Story"


class TestimonialBlock(blocks.StructBlock):
    quote = blocks.TextBlock(required=True)
    name = blocks.CharBlock(required=True, max_length=100)
    role = blocks.CharBlock(required=False, max_length=100)
    image = ImageChooserBlock(required=False)

    class Meta:
        template = "blocks/testimonial_block.html"
        icon = "user"
        label = "Testimonial"


class CTAButtonBlock(blocks.StructBlock):
    text = blocks.CharBlock(required=True, max_length=50)
    url = blocks.URLBlock(required=True)
    style = blocks.ChoiceBlock(
        choices=[
            ('primary', 'Primary'),
            ('secondary', 'Secondary'),
        ],
        default='primary',
        help_text="Button style variant"
    )
    icon_name = blocks.CharBlock(required=False, max_length=50, help_text="Optional icon")

    class Meta:
        template = "blocks/cta_button_block.html"
        icon = "placeholder"
        label = "Call-to-Action Button"
