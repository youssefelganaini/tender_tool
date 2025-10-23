from django.contrib import admin
from .models import (
    Publication,
    PublicationDates,
    PublicationDocument,
    Contractor,
    CPVCode,
)

# Register your models here.
admin.site.register(Publication)
admin.site.register(PublicationDates)
admin.site.register(PublicationDocument)
admin.site.register(Contractor)
admin.site.register(CPVCode)
