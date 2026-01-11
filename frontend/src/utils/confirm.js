// Lightweight DOM-based confirm modal returning a Promise<boolean>
export default function confirmModal(message, { okText = 'OK', cancelText = 'Cancel' } = {}){
  return new Promise(resolve => {
    const overlay = document.createElement('div')
    overlay.style.position = 'fixed'
    overlay.style.top = '0'
    overlay.style.left = '0'
    overlay.style.right = '0'
    overlay.style.bottom = '0'
    overlay.style.background = 'rgba(0,0,0,0.6)'
    overlay.style.display = 'flex'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.zIndex = '9999'

    const box = document.createElement('div')
    box.style.background = '#121212'
    box.style.color = '#fff'
    box.style.padding = '18px'
    box.style.borderRadius = '10px'
    box.style.maxWidth = '560px'
    box.style.width = '90%'
    box.style.boxShadow = '0 12px 30px rgba(0,0,0,0.5)'

    const msg = document.createElement('div')
    msg.style.marginBottom = '14px'
    msg.style.fontSize = '15px'
    msg.style.lineHeight = '1.3'
    msg.innerText = message

    const actions = document.createElement('div')
    actions.style.display = 'flex'
    actions.style.justifyContent = 'flex-end'
    actions.style.gap = '8px'

    const btnCancel = document.createElement('button')
    btnCancel.innerText = cancelText
    btnCancel.style.padding = '8px 12px'
    btnCancel.style.borderRadius = '8px'
    btnCancel.style.border = '1px solid rgba(255,255,255,0.06)'
    btnCancel.style.background = 'transparent'
    btnCancel.style.color = '#ddd'
    btnCancel.style.cursor = 'pointer'

    const btnOk = document.createElement('button')
    btnOk.innerText = okText
    btnOk.style.padding = '8px 12px'
    btnOk.style.borderRadius = '8px'
    btnOk.style.border = 'none'
    btnOk.style.background = '#dc3545'
    btnOk.style.color = '#fff'
    btnOk.style.cursor = 'pointer'

    actions.appendChild(btnCancel)
    actions.appendChild(btnOk)
    box.appendChild(msg)
    box.appendChild(actions)
    overlay.appendChild(box)
    document.body.appendChild(overlay)

    function cleanup(result){
      try{ document.body.removeChild(overlay) }catch(e){}
      resolve(result)
    }

    btnCancel.addEventListener('click', ()=>cleanup(false))
    btnOk.addEventListener('click', ()=>cleanup(true))
    overlay.addEventListener('click', e=>{ if(e.target === overlay) cleanup(false) })
    // focus the OK button for keyboard users
    btnOk.focus()
  })
}
