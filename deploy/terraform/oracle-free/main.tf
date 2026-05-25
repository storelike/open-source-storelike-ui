terraform {
  required_providers {
    oci = {
      source  = "oracle/oci"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"
}

provider "oci" {
  tenancy_ocid     = var.tenancy_ocid
  user_ocid        = var.user_ocid
  fingerprint      = var.fingerprint
  private_key_path = var.private_key_path
  region           = var.region
}

data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid
}

resource "oci_core_vcn" "aikit_vcn" {
  compartment_id = var.tenancy_ocid
  display_name   = "aikit-vcn"
  cidr_blocks    = ["10.0.0.0/16"]
}

resource "oci_core_internet_gateway" "aikit_igw" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.aikit_vcn.id
  display_name   = "aikit-igw"
  enabled        = true
}

resource "oci_core_route_table" "aikit_rt" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.aikit_vcn.id
  display_name   = "aikit-rt"

  route_rules {
    destination       = "0.0.0.0/0"
    network_entity_id = oci_core_internet_gateway.aikit_igw.id
  }
}

resource "oci_core_security_list" "aikit_sl" {
  compartment_id = var.tenancy_ocid
  vcn_id         = oci_core_vcn.aikit_vcn.id
  display_name   = "aikit-sl"

  egress_security_rules {
    protocol    = "all"
    destination = "0.0.0.0/0"
  }

  ingress_security_rules {
    protocol = "6" # TCP
    source   = "0.0.0.0/0"
    tcp_options {
      min = 22
      max = 22
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 80
      max = 80
    }
  }

  ingress_security_rules {
    protocol = "6"
    source   = "0.0.0.0/0"
    tcp_options {
      min = 443
      max = 443
    }
  }
}

resource "oci_core_subnet" "aikit_subnet" {
  compartment_id    = var.tenancy_ocid
  vcn_id            = oci_core_vcn.aikit_vcn.id
  cidr_block        = "10.0.1.0/24"
  display_name      = "aikit-subnet"
  route_table_id    = oci_core_route_table.aikit_rt.id
  security_list_ids = [oci_core_security_list.aikit_sl.id]
}

data "oci_core_images" "ubuntu" {
  compartment_id           = var.tenancy_ocid
  operating_system         = "Canonical Ubuntu"
  operating_system_version = "24.04"
  shape                    = "VM.Standard.A1.Flex"
  sort_by                  = "TIMECREATED"
  sort_order               = "DESC"
}

resource "oci_core_instance" "aikit" {
  compartment_id      = var.tenancy_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  display_name        = "aikit-server"
  shape               = "VM.Standard.A1.Flex"

  shape_config {
    ocpus         = var.instance_ocpus
    memory_in_gbs = var.instance_memory_gb
  }

  source_details {
    source_type = "image"
    source_id   = data.oci_core_images.ubuntu.images[0].id
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.aikit_subnet.id
    assign_public_ip = true
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    user_data = base64encode(templatefile("${path.module}/cloud-init.yml", {
      domain              = var.domain
      anthropic_api_key   = var.anthropic_api_key
      telegram_bot_token  = var.telegram_bot_token
      owner_chat_id       = var.owner_chat_id
      totp_secret         = var.totp_secret
      session_secret      = var.session_secret
    }))
  }
}
