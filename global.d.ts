interface Yaml {
  steps: Step[];
}

interface Step {
  name: string;
  image: string;
  command: string;
  type: "container" | "script";
  env: {
    [key: string]: string;
  };
}
