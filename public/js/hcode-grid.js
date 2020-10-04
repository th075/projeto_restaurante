class HcodeGrid{

constructor(configs){

    configs.listeners = Object.assign({

        afterUpdateClick: (e) => {

            $('#modal-update').modal('show');
    
        },

        afterDeleteClick: (e) => {

            window.location.reload();

        }, 

        afterFormCreate: (e) => {

            window.location.reload();

        },

        afterFormUpdate: (e) => {

            window.location.reload();

        },

        afterFormCreateError: (e) => {

            alert('Não foi possível enviar o formulário.')

        },

        afterFormUpdateError: (e) => {

            alert('Não foi possível atualizar o formulário.')

        }

    }, configs.listeners);

    this.options =  Object.assign({}, {

    formCreate: '#modal-create form',
    formUpdate: '#modal-update form',
    btnUpdate: 'btn-update',
    btnDelete: 'btn-delete',
    onUpdateLoad: (form, name, data) => {

        let input = form.querySelector('[name=' + name +']');
        if(input) input.value = data[name];

    }

    }, configs);

    this.rows = [...document.querySelectorAll('table tbody tr')];
    this.initForms();
    this.initButtons();

}

initForms(){

    let formCreate = document.querySelector(this.options.formCreate);

    if(formCreate){

        formCreate.save({

            success: () => {

                this.fireEvent('afterFormCreate');

            },

            failure: () => {

                this.fireEvent('afterFormCreateError');

            }

        });
        
    }


    this.formUpdate = document.querySelector(this.options.formUpdate);

    if(this.formUpdate){

        this.formUpdate.save({

            success: () => {

                this.fireEvent('afterFormCreate');

            },

            failure: () => {

                this.fireEvent('afterFormCreateError');

            }

        });

    }

}

fireEvent(name, args){

    if(typeof this.options.listeners[name] === 'function') this.options.listeners[name].apply(this, args);

}

getTrData(event){

    let tr = event.path.find(el => {

        return (el.tagName.toUpperCase() === 'TR');

    });

    return JSON.parse(tr.dataset.row);

}

btnUpdateClick(event){
    

    this.fireEvent('beforeUpdateClick', [event]);

    let data = this.getTrData(event);

    for(let name in data){

        this.options.onUpdateLoad(this.formUpdate, name, data);

    }

    this.fireEvent('afterUpdateClick', (event));


}

btnDeleteClick(event){

    this.fireEvent('beforeDeleteClick', [event]);

    let data = this.getTrData(event);

    if(confirm(eval('`' + this.options.deleteMsg + '`'))){

        fetch(eval('`' + this.options.deleteUrl + '`'), {

        method: 'DELETE'

        }).then(response => response.json()).then(json => {

            this.fireEvent('afterDeleteClick');

        });

    }

}

initButtons(){

    this.rows.forEach(row => {

        [...row.querySelectorAll('.btn')].forEach(btn => {

            btn.addEventListener('click', e=> {

                if(e.target.classList.contains(this.options.btnUpdate)){

                    this.btnUpdateClick(e);

                } else if(e.target.classList.contains(this.options.btnDelete)){

                    this.btnDeleteClick(e);

                } else{

                    this.fireEvent('buttonClick', [e.target, this.getTrData(e), e]);

                }

            });

        });

    });

}

}