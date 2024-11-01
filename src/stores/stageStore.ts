import { defineStore } from "pinia";
import { ref } from "vue";
import { stages } from "@/utils/stages";

export const useStageStore = defineStore("nodesStore", () => {
  const stage = ref<string>("activity");
  const setStage = (newStage: string) => {
    if (newStage in stages) {
      stage.value = newStage;
    }
  };
  return {
    stage,
    setStage,
  };
});
