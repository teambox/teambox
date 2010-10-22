// When the URL is like /something#!/route/to/something, then we redirect to /route/to/something
var route = window.location.hash.split("#!")[1]
if(route) {
  window.location = route
}

addHashForAjaxLink = function(route) {
  window.location.hash = "!" + route
}

// For Projects#index: Load task in main view with AJAX
document.on('click', '.my_tasks_listing .task a', function(e, el) {
  if (e.isMiddleClick()) return
  e.stop()
  
  el.up('.task').down('.left_arrow_icon').hide()
  el.up('.task').down('.loading_icon').show()
  
  new Ajax.Request(el.readAttribute('href')+".frag", {
    method: "get",
    onSuccess: function(r) {
      $('content').update(r.responseText)
      format_posted_date()
      addHashForAjaxLink(el.readAttribute('href'))
      $('back_to_overview').show()
    },
    onComplete: function() {
      el.up('.task').down('.left_arrow_icon').show()
      el.up('.task').down('.loading_icon').hide()
    }
  })

})

// Remove task from sidebar if it's not assigned to me anymore
document.on('ajax:success', '.task form', function(e, form) {
  var status = form.down("select[name='task[status]']").getValue()
  var person = form.down("select[name='task[assigned_id]']").getValue()

  // my_projects contains a list of my Person models, we look them up to see if it's me
  var is_assigned_to_me = (status == 1) && my_projects[person]
  var task = $('my_tasks_'+form.up('.thread').readAttribute('data-id'))

  if(task) {
    if(is_assigned_to_me) { task.show() } else { task.hide() }
  }
})

// TODO: If i assign something to myself, it should be added to my task list

// Load activities on main view using AJAX
document.on('click', '#back_to_overview', function(e, el) {
  if (e.isMiddleClick()) return
  e.stop()

  $('content').update("<div class='loading_icon'> </div>")

  new Ajax.Request(el.readAttribute('href')+".frag", {
    method: "get",
    onSuccess: function(r) {
      $('content').update(r.responseText)
      format_posted_date()
      addHashForAjaxLink(el.readAttribute('href'))
      $('back_to_overview').hide()
    }
  })
})

// Expand task threads inline in TaskLists#index
document.on('click', '.task_list_container a.name', function(e, el) {
  if (e.isMiddleClick()) return
  e.stop()

  var task = el.up('.task')
  var block_id = "inline_"+task.readAttribute("id")

  if (task.hasClassName('expanded')) {
    task.removeClassName('expanded')
    new Effect.BlindUp(block_id, {duration: 0.5});
    setTimeout(function() { $(block_id).remove() }, 500 )
  } else {
    if (!task.down('.loading_icon')) {
      task.down('span.task_status').insert({ before: "<div class='loading_icon'> </div>" })
      task.down('span.task_status').hide()
    }
    new Ajax.Request(el.readAttribute('href')+".frag", {
      method: "get",
      onSuccess: function(r) {
        task.down('.loading_icon').remove()
        task.down('span.task_status').show()
        var block = "<div class='task_inline' style='display:none' id='"+block_id+"'>"+r.responseText+"</div>"
        task.insert({ bottom: block })
        new Effect.BlindDown(block_id, {duration: 0.5});
        task.addClassName('expanded')
        format_posted_date()
      }
    })
  }
})

// Update the parent task when commenting from a task thead that's been expanded inline
document.on('ajax:success', '.task_inline form', function(e, form) {
  var task = form.up('.task.expanded')
  if(!task) return

  var task_data = e.memo.headerJSON

  var status_comments = task.down('.task_status')
  status_comments.update(parseInt(status_comments.innerHTML) + 1)

  var status = task_data.status
  var status_name = $w("new open hold resolved rejected")[status]

  var person = task_data.assigned_id
  var is_assigned_to_me = (status == 1) && my_projects[person]

  // Cleanup the current status of the task
  task.className = task.className.replace(/(^|\s+)user_(.+?)(\s+|$)/, ' ').strip()
  task.className = task.className.replace(/(^|\s+)status_(.+?)(\s+|$)/, ' ').strip()
  task.down('.assigned_user') && task.down('.assigned_user').remove()

  // Mark as mine if it's assigned to me
  is_assigned_to_me ? task.addClassName('mine') : task.removeClassName('mine')

  // Update the status of the task
  task.addClassName('status_'+status_name)

  // Show new assigned user name if there's an assigned user
  if (status == 1) {
    task.addClassName('user_'+task_data.assigned.user_id)
    var short_name = task_data.assigned.user.last_name
    task.down('a.name').insert({after: " <span class='assigned_user'>"+short_name+"</span> "})
  }
  
  // Hide dates for resolved tasks
  if (status == 3 || status == 4) {
    task.down('.assigned_date') && task.down('.assigned_date').remove()
  }
})
