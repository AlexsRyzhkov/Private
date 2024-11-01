interface Lesson {
    name: string;
    hours: number;
  }
  
  interface Topic {
    name: string;
    semesters: number[];
    lessons: Lesson[];
  }
  
  interface Indicator {
    code: string;
    name: string;
    topics: Topic[];
  }
  
  interface Discipline {
    code: string;
    name: string;
    indicators: Indicator[];
  }
  
  interface Competence {
    code: string;
    name: string;
    disciplines: Discipline[];
  }
  
  interface Task {
    name: string;
    competences: Competence[];
  }
  
  interface Activity {
    name: string;
    tasks: Task[];
  }
  
  interface ExportImportData {
    total_hours_by_plan: number;
    total_hours_calc: number;
    activities: Activity[];
  }
  
  // Преобразование узлов из старого формата в новый
  export const exportData = (inputData: any) => {
    const nodes = inputData.nodes;
  
    const transformedData: ExportImportData = {
      total_hours_by_plan: inputData.total_hours_by_plan,
      total_hours_calc: inputData.total_hours_calc,
      activities: [],
    };
  
    // Поиск активности (activity)
    Object.keys(nodes).forEach((nodeKey) => {
      const node = nodes[nodeKey];
      if (node.stage === "activity") {
        const activity: Activity = {
          name: node.title,
          tasks: getTasks(node.children, nodes),
        };
        transformedData.activities.push(activity);
      }
    });
  
    return transformedData; // Сохранение преобразованных данных
  };
  
  // Получение задач (task) для активности
  const getTasks = (taskIds: string[], nodes: any): Task[] => {
    return taskIds.map((taskId) => {
      const taskNode = nodes[taskId];
      return {
        name: taskNode.title,
        competences: getCompetences(taskNode.children, nodes),
      };
    });
  };
  
  // Получение компетенций (competence) для задачи
  const getCompetences = (competenceIds: string[], nodes: any): Competence[] => {
    return competenceIds.map((competenceId) => {
      const competenceNode = nodes[competenceId];
      return {
        code: competenceNode.code,
        name: competenceNode.title,
        disciplines: getDisciplines(competenceNode.children, nodes),
      };
    });
  };
  
  // Получение дисциплин (discipline) для компетенции
  const getDisciplines = (disciplineIds: string[], nodes: any): Discipline[] => {
    return disciplineIds.map((disciplineId) => {
      const disciplineNode = nodes[disciplineId];
      return {
        code: disciplineNode.code,
        name: disciplineNode.title,
        indicators: getIndicators(disciplineNode.children, nodes),
      };
    });
  };
  
  // Получение индикаторов (indicator) для дисциплины
  const getIndicators = (indicatorIds: string[], nodes: any): Indicator[] => {
    return indicatorIds.map((indicatorId) => {
      const indicatorNode = nodes[indicatorId];
      return {
        code: indicatorNode.code,
        name: indicatorNode.title,
        topics: getTopics(indicatorNode.children, nodes),
      };
    });
  };
  
  // Получение тем (topic) для индикатора
  const getTopics = (topicIds: string[], nodes: any): Topic[] => {
    return topicIds.map((topicId) => {
      const topicNode = nodes[topicId];
      return {
        name: topicNode.title,
        semesters: topicNode.semesters,
        lessons: getLessons(topicNode.children, nodes),
      };
    });
  };
  
  // Получение уроков (lesson) для темы
  const getLessons = (lessonIds: string[], nodes: any): Lesson[] => {
    return lessonIds.map((lessonId) => {
      const lessonNode = nodes[lessonId];
      return {
        name: lessonNode.title,
        hours: lessonNode.hours,
      };
    });
  };
