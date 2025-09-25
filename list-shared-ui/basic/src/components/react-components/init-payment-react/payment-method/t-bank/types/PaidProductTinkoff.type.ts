
  // const productPaymentTinkoff: any = {
  //   Amount: Number(paidProduct?.price),
  //   Name: paidProduct?.title,
  //   Description: `Оплата ${paidProduct.order_id} - ${paidProduct?.title}`,
  //   OrderId: paidProduct.order_id,
  //   // SuccessURL:"https://x038it.ru/api/v1/success-tinkoff",
  //   DATA: {
  //     "Phone": paidProduct.phone_customer || '',
  //     "Email": paidProduct.email_customer,
  //     "TransactionType": "tinkoff",
  //     "ProductId": paidProduct?.order_id
  //   },
  //   Receipt: {
  //     "Email": paidProduct.email_customer,
  //     "Phone": paidProduct.phone_customer || '',
  //     "EmailCompany": configApp.TINKOFF_EMAIL_COMPANY,
  //     "Taxation": configApp.TINKOFF_TAXION_COMPANY,
  //     "Items": [
  //       {
  //         "Name": paidProduct?.title || "Оплата",
  //         "Price": `${Number(paidProduct?.price)}`,
  //         "Quantity": paidProduct.quantity,
  //         "Amount": `${Number(paidProduct?.amount)}`,
  //         "PaymentMethod": "full_prepayment",
  //         "PaymentObject": "service",
  //         "Tax": "none"
  //       }
  //     ]
  //   }
  // };
