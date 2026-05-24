export interface HealthBarConfig {
  width: number;
  height: number;
  borderWidth: number;
  backgroundColor: number;
  borderColor: number;
  fillColor: number;
  depth: number;
}

export interface HealthBarValue {
  current: number;
  total: number;
}
