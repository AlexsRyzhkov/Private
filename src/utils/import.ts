// Функция загрузки нового формата JSON
let transformedData = {};
let nodeIdCounter = 1;

// Преобразование данных из нового формата в старый формат
export const importData = (newData: any) => {
  const transformedNodes: any = {};
  const activities = newData.activities;

  activities.forEach((activity: any) => {
    const activityId = createUniqueId("activity");
    transformedNodes[activityId] = createNode(
      activity,
      "activity",
      activityId,
      null
    );

    activity.tasks.forEach((task: any) => {
      const taskId = createUniqueId("task");
      transformedNodes[taskId] = createNode(task, "task", taskId, activityId);

      task.competences.forEach((competence: any) => {
        const competenceId = createUniqueId("competence");
        transformedNodes[competenceId] = createNode(
          competence,
          "competence",
          competenceId,
          taskId
        );

        competence.disciplines.forEach((discipline: any) => {
          const disciplineId = createUniqueId("discipline");
          transformedNodes[disciplineId] = createNode(
            discipline,
            "discipline",
            disciplineId,
            competenceId
          );

          discipline.indicators.forEach((indicator: any) => {
            const indicatorId = createUniqueId("indicator");
            transformedNodes[indicatorId] = createNode(
              indicator,
              "indicator",
              indicatorId,
              disciplineId
            );

            indicator.topics.forEach((topic: any) => {
              const topicId = createUniqueId("topic");
              transformedNodes[topicId] = createNode(
                topic,
                "topic",
                topicId,
                indicatorId
              );

              topic.lessons.forEach((lesson: any) => {
                const lessonId = createUniqueId("lesson");
                transformedNodes[lessonId] = createNode(
                  lesson,
                  "lesson",
                  lessonId,
                  topicId
                );
              });
            });
          });
        });
      });
    });
  });

  Object.keys(transformedNodes).forEach((nodeKey: any) => {
    const node = transformedNodes[nodeKey];
    if (node.parent) {
      transformedNodes[node.parent].children.push(node.id);
    }
  });
  // Итоговые преобразованные данные в старом формате
  transformedData = {
    total_hours_by_plan: newData.total_hours_by_plan,
    total_hours_calc: newData.total_hours_calc,
    nodes: transformedNodes,
  };

  return transformedData;
};

// Функция для создания уникальных идентификаторов узлов
const createUniqueId = (type: string) => {
  return `${type}_${nodeIdCounter++}`;
};

// Создание узла для старого формата
const createNode = (
  data: any,
  stage: string,
  id: string,
  parentId: string | null
) => {
  return {
    title: data.name || "",
    stage: stage,
    code: data.code || "",
    semesters: data.semesters || [],
    children: [], // Дети добавляются позже
    hours: data.hours || 0,
    id: id,
    parent: parentId,
    state: { checked: false, opened: true },
  };
};
