import { initializeUser } from "./User";
import { associateModels } from "./associate_models";

export const initializeModels = () => {
  initializeUser();

  //Relationships between tables
  associateModels();
};
