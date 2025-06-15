import axios from "axios";

const apiKey = process.env.DOMAINR_API_KEY;

export const getDomainStatus = async (
  domain: string
): Promise<string | undefined> => {
  const apiUrl = `https://domain-availability.whoisxmlapi.com/api/v1?apiKey=${apiKey}&domainName=${domain}&outputFormat=JSON`;

  try {
    const res = await axios.get(apiUrl);
    console.log(res.data.DomainInfo.domainAvailability);
    return res.data.DomainInfo.domainAvailability;
  } catch (error) {
    console.log(error);
  }
};
