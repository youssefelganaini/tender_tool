from rest_framework import serializers
from .models import (
    PublicationDates,
    Contractor,
    CPVCode,
    Publication,
    PublicationDocument,
)


class PublicationDatesSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationDates
        fields = "__all__"


class ContractorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Contractor
        fields = "__all__"


class CPVCodeSerializer(serializers.ModelSerializer):
    class Meta:
        model = CPVCode
        fields = "__all__"


class PublicationDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationDocument
        fields = "__all__"


class PublicationSerializer(serializers.ModelSerializer):
    dates = PublicationDatesSerializer(read_only=True)
    contracting_authority = ContractorSerializer(read_only=True)
    cpv_codes = CPVCodeSerializer(many=True, read_only=True)
    tender_documents = PublicationDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Publication
        fields = "__all__"
