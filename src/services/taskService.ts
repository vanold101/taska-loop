import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TaskData } from '@/components/TaskDetailModal';

const TASKS_COLLECTION = 'tasks';

// Get all tasks for a user
export const getUserTasks = (userId: string, callback: (tasks: TaskData[]) => void) => {
  const q = query(
    collection(db, TASKS_COLLECTION),
    where('assignees', 'array-contains', { id: userId })
  );
  
  return onSnapshot(q, (querySnapshot) => {
    const tasks: TaskData[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      tasks.push({
        id: doc.id,
        title: data.title,
        dueDate: data.dueDate,
        priority: data.priority,
        isRotating: data.isRotating,
        location: data.location,
        notes: data.notes,
        assignees: data.assignees || [],
        completed: data.completed || false
      });
    });
    callback(tasks);
  });
};

// Create a new task
export const createTask = async (taskData: Omit<TaskData, 'id'>) => {
  try {
    const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating task: ", error);
    throw error;
  }
};

// Update a task
export const updateTask = async (taskId: string, taskData: Partial<TaskData>) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    await updateDoc(taskRef, {
      ...taskData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating task: ", error);
    throw error;
  }
};

// Mark a task as complete
export const completeTask = async (taskId: string) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    
    // Get the current task data
    const taskDoc = await getDocs(query(collection(db, TASKS_COLLECTION), where('__name__', '==', taskId)));
    
    if (taskDoc.empty) {
      throw new Error('Task not found');
    }
    
    const taskData = taskDoc.docs[0].data();
    
    // If task is rotating, update assignees order
    if (taskData.isRotating && taskData.assignees.length > 1) {
      const assignees = [...taskData.assignees];
      const firstAssignee = assignees.shift();
      assignees.push(firstAssignee);
      
      await updateDoc(taskRef, {
        completed: true,
        assignees,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    } else {
      await updateDoc(taskRef, {
        completed: true,
        completedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }
    
    return true;
  } catch (error) {
    console.error("Error completing task: ", error);
    throw error;
  }
};

// Delete a task
export const deleteTask = async (taskId: string) => {
  try {
    await deleteDoc(doc(db, TASKS_COLLECTION, taskId));
    return true;
  } catch (error) {
    console.error("Error deleting task: ", error);
    throw error;
  }
};

// Share a task with another user
export const shareTaskWithUser = async (taskId: string, user: { id: string, name: string, avatar?: string }) => {
  try {
    const taskRef = doc(db, TASKS_COLLECTION, taskId);
    
    // Get the current task data
    const taskDoc = await getDocs(query(collection(db, TASKS_COLLECTION), where('__name__', '==', taskId)));
    
    if (taskDoc.empty) {
      throw new Error('Task not found');
    }
    
    const taskData = taskDoc.docs[0].data();
    
    // Check if user is already an assignee
    if (taskData.assignees.some((assignee: any) => assignee.id === user.id)) {
      throw new Error('User is already assigned to this task');
    }
    
    // Add user to assignees
    const assignees = [...taskData.assignees, user];
    
    await updateDoc(taskRef, {
      assignees,
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error("Error sharing task: ", error);
    throw error;
  }
};
