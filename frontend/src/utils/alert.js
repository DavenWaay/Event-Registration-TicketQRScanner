// Lightweight DOM-based alert modal returning a Promise<void>
export default function alertModal(message, { okText = 'OK' } = {}){
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

    const btnOk = document.createElement('button')
    btnOk.innerText = okText
    btnOk.style.padding = '8px 12px'
    btnOk.style.borderRadius = '8px'
    btnOk.style.border = 'none'
    btnOk.style.background = '#667eea'
    btnOk.style.color = '#fff'
    btnOk.style.cursor = 'pointer'

    actions.appendChild(btnOk)
    box.appendChild(msg)
    box.appendChild(actions)
    overlay.appendChild(box)
    document.body.appendChild(overlay)

    function cleanup(){
      try{ document.body.removeChild(overlay) }catch(e){}
      resolve()
    }

    btnOk.addEventListener('click', cleanup)
    overlay.addEventListener('click', e=>{ if(e.target === overlay) cleanup() })
    btnOk.focus()
  })
}
