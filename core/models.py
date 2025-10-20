from django.db import models


class PublicationDates(models.Model):
    period_start = models.DateField(null=True, blank=True)
    period_end = models.DateField(null=True, blank=True)
    application_deadline = models.CharField(max_length=100, null=True, blank=True)
    award_period = models.DateField(null=True, blank=True)
    expiration_time = models.DateTimeField(null=True, blank=True)
    bidders_requests_deadline = models.CharField(max_length=100, null=True, blank=True)

    def __str__(self):
        return f"Dates from {self.period_start} to {self.period_end}"


class Contractor(models.Model):
    name = models.CharField(max_length=255, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    contact_email = models.EmailField(null=True, blank=True)

    def __str__(self):
        return self.name or "Unknown Contractor"


class CPVCode(models.Model):
    code = models.CharField(max_length=20, unique=True)
    description = models.CharField(max_length=255, null=True, blank=True)

    def __str__(self):
        return f"{self.code} - {self.description or 'No description'}"


class Publication(models.Model):
    tender_number = models.CharField(max_length=100, unique=True)
    title = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    tender_procedure = models.CharField(max_length=255, null=True, blank=True)
    execution_place = models.CharField(max_length=255, null=True, blank=True)
    subdivision_into_lots = models.BooleanField(default=False)
    side_offers_allowed = models.BooleanField(default=False)
    several_main_offers_allowed = models.BooleanField(default=False)
    portal = models.CharField(max_length=100, default="No Portal")
    publication_url = models.URLField(default="https://www.google.com/")

    dates = models.OneToOneField(
        PublicationDates, on_delete=models.CASCADE, related_name="publication"
    )
    contracting_authority = models.ForeignKey(
        Contractor, on_delete=models.CASCADE, related_name="publications"
    )
    cpv_codes = models.ManyToManyField(CPVCode, related_name="publications", blank=True)

    def __str__(self):
        return f"{self.tender_number} - {self.title}"


class PublicationDocument(models.Model):
    filename = models.CharField(max_length=255)
    download_link = models.URLField()
    tender = models.ForeignKey(
        Publication,
        related_name="tender_documents",
        null=True,
        on_delete=models.CASCADE,
    )

    def __str__(self):
        return self.filename
