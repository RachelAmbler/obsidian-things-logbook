import * as os from "os";

import { THINGS_DB_PATH } from "./constants";
import { querySqliteDB } from "./sqlite";

export const TASK_FETCH_LIMIT = 1000;

export interface ISubTask {
  completed: boolean;
  title: string;
}

export interface ITask {
  uuid: string;
  title: string;
  notes: string;
  area?: string;
  tags: string[];
  startDate: number;
  stopDate: number;
  cancelled: boolean;
  subtasks: ISubTask[];
}

export interface ITaskRecord {
  uuid: string;
  title?: string;
  notes: string;
  area?: string;
  startDate: number;
  stopDate: number;
  status: string;
  tag?: string;
}

export interface IChecklistItemRecord {
  uuid: string;
  taskId: string;
  title: string;
  startDate: number;
  stopDate: number;
}

const thingsSqlitePath = THINGS_DB_PATH.replace("~", os.homedir());

export class ThingsSQLiteSyncError extends Error {}


const STATUS_CANCELLED = 2;

export function buildTasksFromSQLRecords(
  taskRecords: ITaskRecord[],
  checklistRecords: IChecklistItemRecord[]
): ITask[] {
  const tasks: Record<string, ITask> = {};
  taskRecords.forEach(({ tag, ...task }) => {
    const id = task.uuid;
    const { status, title, ...other } = task;

    if (tasks[id]) {
      tasks[id].tags.push(tag);
    } else {
      tasks[id] = {
        ...other,
        cancelled: STATUS_CANCELLED === Number.parseInt(status),
        title: (title || "").trimEnd(),
        subtasks: [],
        tags: [tag],
      };
    }
  });

  checklistRecords.forEach(({ taskId, title, stopDate }) => {
    const task = tasks[taskId];
    const subtask = {
      completed: !!stopDate,
      title: title.trimEnd(),
    };

    // Fetching checklists can be dicey - so rather than try to connect the dots on when they were
    // checked individually (which Things3 doesn't even expose to the user) we'll just bring them
    // back regardless

    if (task) {
      if (task.subtasks) {
        task.subtasks.push(subtask);
      } else {
        task.subtasks = [subtask];
      }
    }
  });

  return Object.values(tasks);
}

async function getTasksFromThingsDb(
  latestSyncTime: number
): Promise<ITaskRecord[]> {
  return querySqliteDB<ITaskRecord>(
    thingsSqlitePath,
    `
Select    T.uuid as uuid
         ,T.title as title
         ,T.notes as notes
         ,T.startDate as startDate
         ,T.stopDate as stopDate
         ,T.status as status
         ,Ta.title as area
         ,Tt.title as tag
    From  TMTask As T
    Left
    Join  TMTaskTag As Ttt
      On    T.uuid = Ttt.tasks
   Left
   Join   TMTag As Tt
     On     Ttt.tags = Tt.uuid
   Left
   Join   TMArea As Ta
     On      T.area = Ta.uuid
   Where   T.trashed = 0
     And   T.stopDate Is Not Null
     And   T.stopDate > ${latestSyncTime}
   Order
     By    T.stopDate
   Limit   ${TASK_FETCH_LIMIT}
`
  );
}

async function getChecklistItemsThingsDb(latestSyncTime: number): Promise<IChecklistItemRecord[]> {
  return querySqliteDB<IChecklistItemRecord>(thingsSqlitePath,
    `
Select     CL.task As taskId
          ,CL.title As title
          ,T.stopDate As stopDate
   From    TMChecklistItem As CL
   Join    TMTask As T
    On       CL.task = T.uuid
   Where   CL.status = 3
     And   T.stopDate > ${latestSyncTime}
     And   CL.title Is Not ""
   Order
      By   T.stopDate
   Limit   ${TASK_FETCH_LIMIT}
`
  );
}

export async function getTasksFromThingsLogbook(latestSyncTime: number): Promise<ITaskRecord[]> {
  const taskRecords: ITaskRecord[] = [];
  let isSyncCompleted = false;

  try {

    while (!isSyncCompleted) {

      const batch = await getTasksFromThingsDb(latestSyncTime);

      isSyncCompleted = batch.length < TASK_FETCH_LIMIT;
      // Filtering seems to be wierd. Commenting out for now
      //stopTime = batch.filter((t) => t.stopDate).last()?.stopDate;

      taskRecords.push(...batch);
      console.debug(
        `[Things Logbook] fetched ${batch.length} tasks from sqlite db`
      );
    }
  } catch (err) {
    console.error("[Things Logbook] Failed to query the Things SQLite DB", err);
    throw new ThingsSQLiteSyncError("fetch Tasks failed");
  }

  return taskRecords;
}

export async function getChecklistItemsFromThingsLogbook(latestSyncTime: number): Promise<IChecklistItemRecord[]> {
  const checklistItems: IChecklistItemRecord[] = [];
  let isSyncCompleted = false;

  try {
    while (!isSyncCompleted) {
      console.debug(
        `[Things Logbook] fetching checklist items from sqlite db with stopTime of ${latestSyncTime}`
      );

      const batch = await getChecklistItemsThingsDb(latestSyncTime);

      isSyncCompleted = batch.length < TASK_FETCH_LIMIT;
      // Filtering seems to be wierd. Commenting out for now
      //stopTime = batch.filter((t) => t.stopDate).last()?.stopDate;

      checklistItems.push(...batch);
      console.debug(
        `[Things Logbook] fetched ${batch.length} checklist items from sqlite db`
      );
    }
  } catch (err) {
    console.error("[Things Logbook] Failed to query the Things SQLite DB", err);
    throw new ThingsSQLiteSyncError("fetch Subtasks failed");
  }

  return checklistItems;
}
