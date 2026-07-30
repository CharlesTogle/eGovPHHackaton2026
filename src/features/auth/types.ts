export interface EgovProfile {
  uniqid: string
  email: string
  first_name: string
  middle_name: string | null
  last_name: string
  suffix: string | null
  mobile: string
  barangay: string
  barangay_code: string
  municipality: string
  municipality_code: string
  province: string
  province_code: string
  region: string
  region_code: string
  photo: string | null
}

export type DemoIdentity = "josie" | "alexis" | "maria" | "pedro" | "dev" | "lgu"
