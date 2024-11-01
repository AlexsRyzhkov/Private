<script setup lang="ts">
import { ref, unref, onBeforeMount, watch, computed } from "vue";
import { onClickOutside } from "@vueuse/core";
import Multiselect from 'vue-multiselect'
import treeview from "vue3-treeview";
import "vue3-treeview/dist/style.css";

import { useRoute } from "vue-router";
import { useStageStore } from "@/stores/stageStore";
import { stages } from "@/utils/stages";
import { exportData } from "@/utils/export";
import { importData } from "@/utils/import";

const route = useRoute();
const stageStore = useStageStore();

const nodes = ref<Record<string, any>>({});
const config = ref({
  roots: <string[]>[],
  openedIcon: {
    type: "img",
    height: 16,
    width: 16,
    src: "minus.png",
  },
  closedIcon: {
    type: "img",
    height: 16,
    width: 16,
    src: "add.png",
  },
  keyboardNavigation: true,
  checkboxes: true,
});
const th = ref<number>(0.0);

const lh = ref<number>(0.0);
// Весовой коэффициент выбранного узла
const editNode = ref<Record<string, any>>({});
const editNodeLabel = ref<string>("");
const editNodeHours = ref<number | null>(null);
const editNodeCode = ref<string>("");

const editSelectedIndicators = ref<any[]>([]);
const editAvailableIndicators = ref<any[]>([]);

const addEditedIndicator = (newIndicator: string) => {
  const tag = {
    name: newIndicator,
    code: newIndicator.substring(0, 2) + Math.floor(Math.random() * 10000000),
  };
  editSelectedIndicators.value.push(tag);
  editAvailableIndicators.value.push(tag);
};

const editNodeSemesters = ref<number[]>([]);

// Функция для обновления выбора семестра
const toggleEditSemester = (semester: number) => {
  const index = editNodeSemesters.value.indexOf(semester);
  if (index === -1) {
    editNodeSemesters.value.push(semester);
  } else {
    editNodeSemesters.value.splice(index, 1);
  }
};

const newNodeLabel = ref<string>("");
const newNodeHours = ref<number | null>(null);
const newNodeCode = ref<string>("");

const newSelectedIndicators = ref<any[]>([]);
const newAvailableIndicators = ref<any[]>([]);

const multipleSelectFlag = ref<boolean>(true);
const taggableSelectFlag = ref<boolean>(true);


const addIndicator = (newIndicator: string) => {
  const tag = {
    name: newIndicator,
    code: newIndicator.substring(0, 2) + Math.floor(Math.random() * 10000000),
  };
  newSelectedIndicators.value.push(tag);
  newAvailableIndicators.value.push(tag);
};

const selectedSemesters = ref<number[]>([]);

// Функция для обновления выбора семестра
const toggleSemester = (semester: number) => {
  const index = selectedSemesters.value.indexOf(semester);
  if (index === -1) {
    selectedSemesters.value.push(semester);
  } else {
    selectedSemesters.value.splice(index, 1);
  }
};

const parentId = ref<string>("");
const currentStageName = ref<string>("");
const currentNode = ref<Record<string, any>>({});
const currentPage = ref<string>(stageStore.stage || "activity");

const stageName = ref<string>("");

const target = ref(null);
const codeFlag = ref<boolean>(false);
const codeStages = ["competence", "discipline", "indicator"];

const selectNode = (node: any) => {
  parentId.value = node.id;
  currentNode.value = node;
  editNode.value = node;
  editNodeLabel.value = unref(node.title);

  currentStageName.value = unref(node.stage);
  if (codeStages.includes(node.stage)) {
    editNodeCode.value = unref(node.code);
  }
  if (node.stage === "topic") {
    editNodeSemesters.value = Array.from(node.semesters);
    multipleSelectFlag.value = false;
    taggableSelectFlag.value = false;
    newAvailableIndicators.value = getAvailableIndicators(unref(node.parent));
  }
  if (node.stage === "lesson") {
    editNodeHours.value = unref(node.hours);
    multipleSelectFlag.value = false;
    taggableSelectFlag.value = false;
    editSelectedIndicators.value = [unref(node.indicators)];
    editAvailableIndicators.value = getAvailableIndicators(unref(node.parent));;
  }
  if (node.stage === "competence"){
    editSelectedIndicators.value = Array.from(node.indicators);
    editAvailableIndicators.value = Array.from(node.indicators);
    multipleSelectFlag.value = true;
    taggableSelectFlag.value = true;
  }
  if (node.stage === "task"){
    multipleSelectFlag.value = true;
    taggableSelectFlag.value = true;
  }
};

const getAvailableIndicators = (parent: string): string[] => {
  if (nodes.value[parent].stage === 'competence'){
    return nodes.value[parent].indicators;
  }
  return getAvailableIndicators(nodes.value[parent].parent);
}

const checkNode = (node: any) => {
  // console.log()
};

const resetStage = () => {
  parentId.value = "";
  currentNode.value = {};
  editNode.value = {};
  currentStageName.value = "";
  editNodeLabel.value = "";
  editNodeCode.value = "";
  editNodeHours.value = null;
  editNodeSemesters.value = [];
  editSelectedIndicators.value = [];
  editAvailableIndicators.value = [];

};

const removeNode = (id: string) => {
  if (!nodes.value[id]) {
    return; // Если узла с таким id нет, выходим из функции
  }
  const indexRoots = config.value.roots.indexOf(id);
  if (indexRoots !== -1) {
    config.value.roots.splice(indexRoots, 1);
  }
  if (nodes.value[id]?.children) {
    const children = nodes.value[id].children;
    if (children.length) {
      children.forEach((key: string) => {
        removeNode(key);
      });
    }
  }

  if (nodes.value[id]?.stage === "lesson") {
    th.value -= nodes.value[id].hours;
  }
  delete nodes.value[id];
};

const clearNodes = () => {
  // nodes.value = {};
  // config.value.roots = [];
  Object.keys(nodes.value).forEach((key) => {
    delete nodes.value[key];
  });

  // Очищаем корневые узлы
  config.value.roots.splice(0, config.value.roots.length);
  th.value = 0.0;
};

const findNodeById = (nodesList: Record<string, any>, id: string): any => {
  for (const key in nodesList) {
    if (key === id) {
      return nodesList[key];
    }

    const node = nodesList[key];
    if (node.children && node.children.length > 0) {
      const childNode = findNodeById(node.children, id);
      if (childNode) {
        return childNode;
      }
    }
  }

  return null;
};

const updateNodeText = (node: any) => {
  // Обновляем текст узла с учетом его owc или wc

  if (node.stage === "lesson") {
    node.text = `${stages["lesson"].node_label}: ${
      node.title
    } (часы: ${node.hours.toFixed(2)}, ВК: ${node.owc.toFixed(2)})`;
  } else if (codeStages.includes(node.stage)) {
    if (node.stage === "indicator") {
      node.text = `${stages[node.stage].node_label}: ${node.title}, Код: ${
        node.code
      }`;
    } else {
      node.text = `${stages[node.stage].node_label}: ${node.title}, Код: ${
        node.code
      } (часы: ${node.th.toFixed(2)}, ВК: ${node.owc.toFixed(2)})`;
    }
  } else if (node.stage === "topic") {
    let semester = node.semesters.join(", ");
    node.text = `${stages[node.stage].node_label}: ${
      node.title
    }, cеместр: ${semester} (часы: ${node.th.toFixed(
      2
    )}, ВК: ${node.owc.toFixed(2)})`;
  } else {
    node.text = `${stages[node.stage].node_label}: ${
      node.title
    } (часы: ${node.th.toFixed(2)}, ВК: ${node.owc.toFixed(2)})`;
  }
};

const calculateowc = (node: any) => {
  if (node?.stage === "lesson") {
    node.owc = node.hours / th.value;
    updateNodeText(node);
    return node.hours;
  }

  let totalLessonHours = 0;

  if (node?.children) {
    node.children.forEach((childId: string) => {
      const childNode = nodes.value[childId];
      totalLessonHours += calculateowc(childNode);
    });
  }

  node.owc = totalLessonHours ? totalLessonHours / th.value : 0;
  node.th = totalLessonHours ? totalLessonHours : 0;
  updateNodeText(node); // Обновляем текст узла
  return totalLessonHours;
};

const updateNodeValues = () => {
  const rootNodes = config.value.roots.map((rootId) => nodes.value[rootId]);
  rootNodes.forEach((rootNode) => {
    calculateowc(rootNode);
  });
};

const uncheckNodes = () => {
  for (const key in nodes.value) {
    if (nodes.value[key].state) {
      nodes.value[key].state.checked = false;
    }
  }
};

const removeCheckedNodes = () => {
  const keysToRemove = [];

  // Найти узлы для удаления
  for (const key in nodes.value) {
    if (nodes.value[key].state && nodes.value[key].state.checked === true) {
      keysToRemove.push(key);
    }
  }

  // Удалить узлы
  keysToRemove.forEach((key) => {
    if (key in nodes.value) {
      if (nodes.value[key]?.parent) {
        const parent = nodes.value[key].parent;
        if (parent && nodes.value[parent]) {
          const index = nodes.value[parent].children.indexOf(key);
          if (index !== -1) {
            nodes.value[parent].children.splice(index, 1);
          }
        }
      }
      removeNode(key);
    }
  });

  newNodeLabel.value = "";
  newNodeHours.value = 0.0;
  newNodeCode.value = "";
  parentId.value = "";
  currentNode.value = {};
  currentStageName.value = "";
};

const getNextStages = (stagelevel: string): Record<string, any> => {
  const keys = Object.keys(stages);
  const startIndex = keys.indexOf(stagelevel);

  if (startIndex === -1 || startIndex === keys.length - 1) {
    return {}; // Возвращаем null, если stagelevel не найден или если он последний
  }

  const nextKey = keys[startIndex + 1];
  return { stage: nextKey, value: stages[nextKey] };
};

const addNode = () => {
  if (newNodeLabel.value.trim() === "") {
    return;
  }

  if (parentId.value === "") {
    const id = `activity_${Math.floor(Math.random() * 10000)}`;
    const newNode = {
      text: `${stages["activity"].node_label}: ${newNodeLabel.value}`,
      hours: null,
      code: "",
      semesters: [],
      title: newNodeLabel.value,
      stage: "activity",
      children: [],
      state: { checked: false, opened: true },
    };
    nodes.value[id] = newNode;
  } else {
    const parent = findNodeById(nodes.value, parentId.value);
    if (parent && parent.children) {
      const stage = parentId.value.match(/(.*)_/);
      if (stage) {
        const nextStage = getNextStages(stage[1]);
        if (Object.entries(nextStage).length === 0) {
          newNodeLabel.value = "";
          newNodeHours.value = 0.0;
          parentId.value = "";
          currentNode.value = {};
          currentStageName.value = "";
          return;
        }
        let text = "";
        const newNode = {
          text: text,
          hours: newNodeHours.value,
          code: newNodeCode.value,
          semesters: selectedSemesters.value,
          title: newNodeLabel.value,
          stage: nextStage.stage,
          indicators: newSelectedIndicators.value,
          children: [],
          state: { checked: false, opened: true },
        };

        const id = `${nextStage.stage}_${Math.floor(Math.random() * 10000)}`;
        nodes.value[id] = newNode;
        if (newNode.stage === "lesson" && newNode.hours) {
          th.value += newNode.hours;
        }
        parent.children.push(id);
      }
    }
  }
  calculateRoots();
  newNodeLabel.value = "";
  newNodeHours.value = 0.0;
  newNodeCode.value = "";
  selectedSemesters.value = [];
  newSelectedIndicators.value = [];
  newAvailableIndicators.value = [];
};

const exportToJson = () => {
  const data = {
    total_hours_by_plan: lh.value,
    total_hours_calc: th.value,
    nodes: nodes.value,
  };
  const tranformedData = exportData(data);

  const dataStr = JSON.stringify(tranformedData);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = "data.json";

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();
};

const importFromJson = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (!input.files?.length) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    try {
      if (e.target?.result) {
        const parsedData = JSON.parse(e.target.result as string);
        clearNodes();
        const tranformedData = importData(parsedData);
        // Обновляем реактивный объект nodes новыми данными
        lh.value = tranformedData["total_hours_by_plan"];
        const parsedNodes = tranformedData["nodes"];
        Object.keys(parsedNodes).forEach((key) => {
          nodes.value[key] = parsedNodes[key];
          const stage = key.match(/(.*)_/);
          if (stage) {
            switch (stage[1]) {
              case "activity": {
                config.value.roots.push(key);
              }
              case "lesson": {
                th.value += nodes.value[key].hours;
              }
            }
          }
        });
        updateNodeValues();
        calculateRoots();
      }
    } catch (err) {
      console.error("Ошибка при парсинге JSON:", err);
      alert("Ошибка при чтении файла. Проверьте, что это корректный JSON.");
    }
  };
  reader.readAsText(file);
};

const calculateRoots = () => {
  config.value.roots = [];
  Object.keys(nodes.value).forEach((key: string) => {
    const stage = key.match(/(.*)_/);
    if (stage && (stage[1] as string) === currentPage.value) {
      config.value.roots.push(key);
    }
  });
};
const setStageName = (name: string | null) => {
  if (name === null) {
    stageName.value = stages["activity"].card_label;
  } else {
    const nextStage = getNextStages(name);
    if (Object.entries(nextStage).length === 0) {
      newNodeLabel.value = "";
      newNodeHours.value = 0.0;
      parentId.value = "";
      currentNode.value = {};
      currentStageName.value = "";
      stageName.value = stages["activity"].card_label;
      return;
    }
    if (codeStages.includes(nextStage.stage)) {
      codeFlag.value = true;
    } else {
      codeFlag.value = false;
    }

    stageName.value = `${nextStage.value.card_label} для ${stages[name].for_label} ${currentNode.value.title}`;
  }
};

const removeIndicators = (children: string[], indicators: string[]) => {

  children.forEach((childId: string) => {
      const childNode = nodes.value[childId];
      if(childNode.stage === 'lesson'){
        indicators.forEach((key)=>{
          if (childNode.indicators == key) {
            childNode.indicators = {}
          }
        })
      } else{
        removeIndicators(childNode.children, indicators);
      }
    });

}

const saveNodeChanges = () => {
  const node = editNode.value;
  if (editNodeLabel.value) {
    node.title = editNodeLabel.value;
  } else {
    alert("Название не может быть пустым!");
    return;
  }
  if (codeStages.includes(node.stage)) {
    node.code = unref(editNodeCode.value);
  }
  if (node.stage === "topic") {
    node.semesters = Array.from(editNodeSemesters.value).sort();
  }
  if (node.stage === "lesson") {
    th.value -= node.hours;
    node.hours = unref(editNodeHours.value); // Сохраняем весовой коэффициент, если это lesson
    th.value += unref(node.hours);
    node.indicators = unref(editSelectedIndicators.value);
  }
  if (node.stage === "competence"){
    node.indicators = unref(editSelectedIndicators.value);
    const set = unref(new Set(editSelectedIndicators.value));
    const difference = unref(editAvailableIndicators.value.filter(x => !set.has(x)));
    removeIndicators(node.children, difference)
    editAvailableIndicators.value = unref(editSelectedIndicators.value);
  }
};

onBeforeMount(() => {
  stageName.value = stages["activity"].card_label;
  uncheckNodes();
  if (currentPage.value === "activity") {
    calculateRoots();
  }
  // console.log(props.stage)
});

watch(currentStageName, (newStage: string) => {
  setStageName(newStage);
});

// watch(() => nodesStore.nodes, (newVal) => {
//   if (Object.entries(newVal).length === 0) {
//     stageName.value = stages['activity'].card_label;
//     calculateRoots();
//   }
// })

watch(
  nodes,
  (newVal, oldVal) => {
    updateNodeValues(); // вызываем функцию при любом изменении
  },
  { deep: true }
);

watch(
  () => stageStore.stage,
  (newStage, oldStage) => {
    // Здесь можно выполнять дополнительные действия при изменении stage
    if (newStage) {
      currentPage.value = newStage;
      calculateRoots();
    } else {
      currentPage.value = "activity";
      calculateRoots();
    }
    setStageName(null);
  }
);
</script>

<template>
  <main>
    <div class="row row-cols-1 row-cols-md-2 g-4">
      <div class="col mt-5">
        <div class="mb-5">
          <label for="limith" class="form-label">Общее количество часов</label>
          <input
            type="number"
            v-model="lh"
            class="form-control"
            id="limith"
            placeholder="Введите общее количество часов"
          />
        </div>
        <div class="card mb-5">
          <div class="card-body">
            <h5 class="card-title">Создать {{ stageName }}</h5>
            <div class="input-group mb-2">
              <input
                type="text"
                aria-label="Название"
                class="form-control"
                placeholder="Название"
                v-model="newNodeLabel"
              />
              <input
                v-if="codeFlag"
                type="text"
                aria-label="Код"
                class="form-control"
                placeholder="Код"
                v-model="newNodeCode"
              />
              <input
                v-if="currentStageName === 'topic'"
                type="number"
                min="0.00"
                step="0.01"
                aria-label="Часы"
                placeholder="Часы"
                class="form-control"
                v-model="newNodeHours"
              />
              <button type="button" class="btn btn-secondary" @click="addNode">
                Добавить
              </button>
            </div>
            <div
              class="semester-selector"
              v-if="currentStageName === 'discipline'"
            >
              <h5>Выберите семестры</h5>
              <div v-for="semester in 10" :key="semester" class="form-check">
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'semester-' + semester"
                  :value="semester"
                  :checked="selectedSemesters.includes(semester)"
                  @change="toggleSemester(semester)"
                />
                <label class="form-check-label" :for="'semester-' + semester">
                  Семестр {{ semester }}
                </label>
              </div>
            </div>
            <div v-if="currentStageName === 'task' || currentStageName === 'topic'">
              <h5 class="card-title">Добавить индикаторы</h5>
              <multiselect
                v-model="newSelectedIndicators"
                tag-placeholder="Добавьте значение как новый индикатор"
                placeholder="Поиск или создание нового индикатора"
                label="name"
                track-by="code"
                :options="newAvailableIndicators"
                :multiple="multipleSelectFlag"
                :taggable="taggableSelectFlag"
                @tag="addIndicator"
              ></multiselect>
            </div>
            <div
              class="btn-group mt-3 form-control"
              style="padding: 0"
              role="group"
            >
              <button type="button" class="btn btn-warning" @click="resetStage">
                Сбросить выбор этапа
              </button>
              <button
                type="button"
                class="btn btn-danger"
                @click="removeCheckedNodes"
              >
                Удалить узел
              </button>
            </div>
          </div>
        </div>
        <div class="card" v-if="editNodeLabel">
          <div class="card-body">
            <h5 class="card-title">
              Изменить {{ stages[editNode.stage].card_label }}
            </h5>
            <div class="input-group mb-2">
              <input
                type="text"
                aria-label="Название"
                class="form-control"
                placeholder="Название"
                v-model="editNodeLabel"
              />
              <input
                v-if="codeStages.includes(currentStageName)"
                type="text"
                aria-label="Код"
                class="form-control"
                placeholder="Код"
                v-model="editNodeCode"
              />
              <input
                v-if="editNode.stage === 'lesson'"
                type="number"
                min="0.00"
                step="0.01"
                aria-label="Часы"
                placeholder="Часы"
                class="form-control"
                v-model="editNodeHours"
              />
              <button
                type="button"
                class="btn btn-secondary"
                @click="saveNodeChanges"
              >
                Сохранить
              </button>
            </div>
            <div v-if="currentStageName === 'competence' ||  editNode.stage === 'lesson'">
              <h5 class="card-title">Выбрать индикаторы</h5>
              <multiselect
                v-model="editSelectedIndicators"
                placeholder="Поиск индикатора"
                label="name"
                track-by="code"
                :options="editAvailableIndicators"
                :multiple="multipleSelectFlag"
                :taggable="taggableSelectFlag"
                @tag="addEditedIndicator"
              ></multiselect>
            </div>
            <div class="semester-selector" v-if="editNode.stage === 'topic'">
              <h5>Выберите семестры</h5>
              <div
                v-for="semesterEdit in 10"
                :key="semesterEdit"
                class="form-check"
              >
                <input
                  class="form-check-input"
                  type="checkbox"
                  :id="'semesterEdit-' + semesterEdit"
                  :value="semesterEdit"
                  :checked="editNodeSemesters.includes(semesterEdit)"
                  @change="toggleEditSemester(semesterEdit)"
                />
                <label
                  class="form-check-label"
                  :for="'semesterEdit-' + semesterEdit"
                >
                  Семестр {{ semesterEdit }}
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col mt-5">
        <div class="card">
          <div class="card-body" ref="target">
            <h5 class="card-title">
              Компетентностная модель
              <span :class="th <= lh ? 'success' : 'alarm'">
                {{ th }}/{{ lh }}
              </span>
            </h5>
            <div class="input-group mb-3">
              <input
                type="file"
                class="form-control"
                @change="importFromJson"
                accept=".json"
              />
            </div>
            <treeview
              :config="config"
              :nodes="nodes"
              @nodeFocus="selectNode"
              @nodeChecked="checkNode"
            >
            </treeview>
            <button
              v-if="Object.keys(nodes).length > 0"
              type="button"
              class="btn btn-outline-secondary form-control"
              @click="exportToJson"
            >
              Экспорт в JSON
            </button>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style>
.success {
  color: #229e1e;
}

.alarm {
  color: #9e2d1e;
}
</style>
