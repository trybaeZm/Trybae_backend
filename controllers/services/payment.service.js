const axios = require("axios");
const xml2js = require("xml2js");
const dotenv = require("dotenv");
dotenv.config();

class PaymentService {
  constructor() {
    this.companyToken = process.env.DPO_COMPANY_TOKEN;
    this.companyRef = process.env.DPO_COMPANY_REF;
    this.backURL = process.env.DPO_BACKURL;
    this.redirectURL = process.env.DPO_REDIRECT_URL;
    this.serviceType = process.env.DPO_SERVICE_TYPE;
    this.currency = process.env.DPO_CURRENCY;
    this.paymentUrl = process.env.DPO_PAYMENT_URL;
  }

  async requestPayment(amount, customerId, description, eventId) {
    try {
      const xmlData = `<API3G>
      <CompanyToken>${this.companyToken}</CompanyToken>
      <Request>createToken</Request>
      <Transaction>
        <PaymentAmount>${amount}</PaymentAmount>
        <PaymentCurrency>${this.currency}</PaymentCurrency>
        <CompanyRef>${this.companyRef}</CompanyRef>
        <RedirectURL>http://www.domain.com/payurl.php</RedirectURL>
        <BackURL>http://www.domain.com/backurl.php</BackURL>
        <CompanyRefUnique>0</CompanyRefUnique>
        <PTL>5</PTL>
      </Transaction>
      <Services>
        <Service>
          <ServiceType>${this.serviceType}</ServiceType>
          <ServiceDescription>${description}</ServiceDescription>
          <ServiceDate>2013/12/20 19:00</ServiceDate>
        </Service>
      </Services>
    </API3G>`;

      // Set the headers for the POST request
      const headers = {
        "Content-Type": "application/xml",
      };

      // Make the POST request using axios
      const response = await axios.post(
        "https://secure.3gdirectpay.com/API/v6/",
        xmlData,
        { headers }
      );

      // Handle the response
      const responseData = response.data;

      // You can parse the XML response if needed (using xml2js, for example)
      const parsedData = await xml2js.parseStringPromise(responseData);

      // Extract the specific values
      const result = {
        Result: parsedData.API3G.Result[0],
        ResultExplanation: parsedData.API3G.ResultExplanation[0],
        TransToken: parsedData.API3G.TransToken[0],
        TransRef: parsedData.API3G.TransRef[0],
        paymentLink: this.paymentUrl + "?ID=" + parsedData.API3G.TransToken[0],
      };

      return result;
    } catch (error) {
      console.log(error, "check for error here");
      throw error;
    }
  }

  // other methods...
}

module.exports = new PaymentService();
