export const initialValues = {
  year: new Date().getFullYear() + 1,
  latitude: "38.196510",
  longitude: "-85.654381",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
}

export const headers = ["Date", "Suhoor", "Fajr", "Sunrise", "Dhuhr", "Asr_s", "Asr_h", "Maghrib", "Isha", "Isha18"];

export const csvHeaders = ["Date", "Suhoor", "Fajr", "Sunrise", "Dhuhr", "Asr_s", "Asr_h", "Maghrib", "Isha", "IshaTwo"];
