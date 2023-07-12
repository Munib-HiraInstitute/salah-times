import { formatInTimeZone } from 'date-fns-tz';

import { csvHeaders } from './App.constants';

export const formatDate = (isoDate, timeZone) => {
  const clean = isoDate.split(" ")[0];
  const timestamp = Date.parse(clean);

  return formatInTimeZone(timestamp, timeZone, "h:mm")
}

export const getCsvHeaders = () => {
  const headersCopy = structuredClone(csvHeaders);
  for (let i=0; i<30; i++) headersCopy.push(...csvHeaders);
  const output = headersCopy.map((header, index) => header + Math.ceil((index + 1)/csvHeaders.length)).join("\t");
  return output + "\n";
}