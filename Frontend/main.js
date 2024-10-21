(function startApp() {
  const TaskService = {
    getAll: function () {
      $.ajax({
        url: "http://localhost:10000/api/tasks/getalltasks",
        type: "GET",
        success: function (response) {
          const todoList = response.filter((task) => task.status === "todo");
          const runningList = response.filter(
            (task) => task.status === "running"
          );
          const completedList = response.filter(
            (task) => task.status === "completed"
          );
          todoList.length > 0 && appendTasks("#my-todos", todoList);
          runningList.length > 0 && appendTasks("#ongoing-todos", runningList);
          completedList.length > 0 &&
            appendTasks("#completed-todos", completedList);

          if (todoList.length + runningList.length + completedList.length > 0) {
            showChart(
              todoList.length,
              runningList.length,
              completedList.length
            );
          } else {
            $("#myPieChart").addClass("hidden").removeClass("flex");
          }
        },
        error: function (error) {
          console.error("Error fetching tasks:", error);
        },
      });
    },
    updateTask: function (id, updatedData, showAlert = true) {
      $.ajax({
        url: `http://localhost:10000/api/tasks/update?id=${id}`,
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(updatedData),
        success: function () {
          closePopup();
          if (showAlert) {
            toastr.success("Task updated successfully");
          } else {
            window.location.reload();
          }
        },
      });
    },
    deleteTask: function (id) {
      $.ajax({
        url: `http://localhost:10000/api/tasks/delete?id=${id}`,
        type: "DELETE",
        success: function () {
          closePopup();
          toastr.success("Task deleted successfully");
          TaskService.getAll();
        },
      });
    },
    createTask: function (newTaskData) {
      $.ajax({
        url: "http://localhost:10000/api/tasks/create",
        type: "POST",
        contentType: "application/json",
        data: JSON.stringify(newTaskData),
        success: function (response) {
          closePopup();
          toastr.success("Task created successfully");
          TaskService.getAll();
        },
        error: function (error) {
          closePopup();
          console.error("Error creating task:", error);
        },
      });
    },
  };

  function getFormattedDate(dateString) {
    var date = new Date(dateString);
    var formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    return formattedDate;
  }

  function appendTasks(selector, tasks) {
    const container = $(selector).find(".todos-items");
    container.empty();
    tasks.forEach((task) => {
      const taskItem = `
        <div data-task-id="${
          task._id
        }"  draggable="true" class="todo-item cursor-pointer rounded-sm bg-slate-500 px-3 py-2 shadow-xl">
          <div class="mb-2 flex items-start justify-between pb-1">
            <span>${task.title}</span>
            <div class="flex gap-2">
            ${
              task.status === "todo"
                ? `<svg
                  class="h-5 w-5 cursor-pointer text-white edit-task-icon"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  data-task-id="${task._id}"
                  data-title="${task.title}"
                  data-assignee="${task.assignee}"
                  data-deadline="${task.deadline}"
                >
                  <path
                    fill-rule="evenodd"
                    d="M11.32 6.176H5c-1.105 0-2 .949-2 2.118v10.588C3 20.052 3.895 21 5 21h11c1.105 0 2-.948 2-2.118v-7.75l-3.914 4.144A2.46 2.46 0 0 1 12.81 16l-2.681.568c-1.75.37-3.292-1.263-2.942-3.115l.536-2.839c.097-.512.335-.983.684-1.352l2.914-3.086Z"
                    clip-rule="evenodd"
                  />
                  <path
                    fill-rule="evenodd"
                    d="M19.846 4.318a2.148 2.148 0 0 0-.437-.692 2.014 2.014 0 0 0-.654-.463 1.92 1.92 0 0 0-1.544 0 2.014 2.014 0 0 0-.654.463l-.546.578 2.852 3.02.546-.579a2.14 2.14 0 0 0 .437-.692 2.244 2.244 0 0 0 0-1.635ZM17.45 8.721 14.597 5.7 9.82 10.76a.54.54 0 0 0-.137.27l-.536 2.84c-.07.37.239.696.588.622l2.682-.567a.492.492 0 0 0 .255-.145l4.778-5.06Z"
                    clip-rule="evenodd"
                  />
                </svg>`
                : ``
            }
            </div>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs">Deadline: ${getFormattedDate(
              task.deadline
            )}</span>
            <span class="text-xs">~ ${task.assignee}</span>
          </div>
        </div>`;
      container.append(taskItem);
    });

    $(".todo-item").on("dragstart", function (e) {
      const taskId = $(this).data("task-id");
      e.originalEvent.dataTransfer.setData("text/plain", taskId);
    });
    $(".todos-items").on("dragover", function (e) {
      e.preventDefault();
    });
    $("#my-todos, #ongoing-todos, #completed-todos").on("drop", function (e) {
      e.preventDefault();
      const taskId = e.originalEvent.dataTransfer.getData("text/plain");
      const id = $(this).attr("id");
      const status =
        id === "my-todos"
          ? "todo"
          : id === "ongoing-todos"
          ? "running"
          : "completed";
      TaskService.updateTask(taskId, { status }, false);
    });

    // Popup Edit Button
    $(".edit-task-icon").on("click", function () {
      const taskId = $(this).data("task-id");
      const title = $(this).data("title");
      const assignee = $(this).data("assignee");
      const deadline = $(this).data("deadline");
      $("#modalTitle").text("Edit Task");
      $("#taskTitle").val(title);
      $("#taskAssignee").val(assignee);
      $("#taskDeadline").val(getFormattedDate(deadline));
      $("#taskModal").removeClass("hidden").addClass("flex");
      $("#deleteTaskBtn").removeClass("hidden").addClass("block");
      sessionStorage.setItem(
        "formType",
        JSON.stringify({ type: "edit", value: taskId })
      );
    });
  }

  function closePopup() {
    $("#taskModal").addClass("hidden").removeClass("flex");
  }

  function registerEventListners() {
    // Popup Add Button
    $("#add-todo").click(function () {
      $("#modalTitle").text("Add Task");
      $("#taskForm")[0].reset();
      $("#taskModal").removeClass("hidden").addClass("flex");
      $("#deleteTaskBtn").removeClass("block").addClass("hidden");
      sessionStorage.setItem(
        "formType",
        JSON.stringify({ type: "add", value: null })
      );
    });
    $("#closeModalBtn").click(function () {
      $("#taskModal").addClass("hidden").removeClass("flex");
    });
  }
  function handleFormEvents() {
    $("#saveTaskBtn").click(function () {
      const popupType =
        sessionStorage.getItem("formType") !== undefined
          ? JSON.parse(sessionStorage.getItem("formType") || "{}")
          : {};
      const { type, value } = popupType;
      if (type === "add") {
        if (
          !$("#taskTitle").val() ||
          !$("#taskAssignee").val() ||
          !$("#taskDeadline").val()
        ) {
          toastr.error("All fields are required!");
          return;
        }
        const request = {
          title: $("#taskTitle").val(),
          assignee: $("#taskAssignee").val(),
          deadline: new Date($("#taskDeadline").val()),
          status: "todo",
        };
        TaskService.createTask(request);
      } else if (type === "edit" && value) {
        if (
          !$("#taskTitle").val() ||
          !$("#taskAssignee").val() ||
          !$("#taskDeadline").val()
        ) {
          toastr.error("All fields are required!");
          return;
        }
        const request = {
          title: $("#taskTitle").val(),
          assignee: $("#taskAssignee").val(),
          deadline: new Date($("#taskDeadline").val()),
          status: "todo",
        };
        TaskService.updateTask(value, request);
      }
    });
    $("#deleteTaskBtn").click(function () {
      const popupType =
        sessionStorage.getItem("formType") !== undefined
          ? JSON.parse(sessionStorage.getItem("formType") || "{}")
          : {};
      const { type, value } = popupType;
      if (type === "edit" && value) {
        TaskService.deleteTask(value);
      }
    });
  }

  function showChart(todo, running, completed) {
    const ctx = document.getElementById("myPieChart").getContext("2d");
    const myPieChart = new Chart(ctx, {
      type: "pie",
      data: {
        labels: ["Todo", "In Progress", "Completed"],
        datasets: [
          {
            label: "My Tasks",
            data: [todo, running, completed],
            backgroundColor: [
              "rgba(255, 99, 132, 0.2)",
              "rgba(54, 162, 235, 0.2)",
              "rgba(255, 206, 86, 0.2)",
            ],
            borderColor: [
              "rgba(255, 99, 132, 1)",
              "rgba(54, 162, 235, 1)",
              "rgba(255, 206, 86, 1)",
            ],
            borderWidth: 1,
          },
        ],
      },
    });
  }

  function init() {
    $(document).ready(() => {
      TaskService.getAll();
      registerEventListners();
      handleFormEvents();
    });
  }
  init();
})();
