export class SuperTask {
  constructor(parallelCount = 2){
    this.parallelCount = parallelCount;
    this.tasks = [];
    this.runningTask = 0;
  }
  
  add(task){
    return new Promise((resolve, reject) => {
      this.tasks.push({task, resolve, reject});
      this.#run();
    });
  }
  
  #run(){
    while(this.runningTask < this.parallelCount && this.tasks.length > 0){
      const {task, resolve, reject} = this.tasks.shift();
      this.runningTask++;
      try {
        task()
          .then(resolve, reject)
          .finally(() => {
            this.runningTask--;
            this.#run();
          });
      } catch(err){
        reject(err);
      }
    }
  }
}

export function processTasks(...tasks){
  let isRunning = false;
  const result = [];
  let i = 0;
  return {
    start(){
      return new Promise(async (resolve, reject) => {
        if(isRunning) return;
        isRunning = true;
        while(i < tasks.length){
          try {
            result.push(await tasks[i]());
          } catch(err){
            result.push(err);
          }
          i++
          if(!isRunning){
            return;
          }
        }
        isRunning = false;
        resolve(result);
      });
    },
    pause(){
      isRunning = false;
    }
  };
}

function _runTask(task, callback){
  const start = Date.now();
  requestAnimatiomFrame(() => {
    if(Date.now() - start < 16.6){
      task();
      callback();
    } else {
      _runTask();
    }
  });
}

export function runTask(task){
  return new Promise((resolve, reject) => {
    _runTask(task, resolve);
  });
}

export const makeWorker = f => {
  let pendingJobs = {};
  const worker = new Worker (
    URL.createObjectURL (new Blob ([`(${f.toString ()})()`]))
  );
  worker.onmessage = ({data: {result, jobId}}) => {
    // 调用resolve，改变Promise状态
    pendingJobs[jobId] (result);
    // 删掉，防止key冲突
    delete pendingJobs[jobId];
  };
  return (...message) =>
    new Promise (resolve => {
      const jobId = String (Math.random ());
      pendingJobs[jobId] = resolve;
      worker.postMessage ({jobId, message});
    });
};
