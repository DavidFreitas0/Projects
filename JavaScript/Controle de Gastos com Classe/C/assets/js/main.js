// Selecionando o formulário 
const transactionForm = document.querySelector('#form-transacao');
//Selecionando Elementos do formulário
const tableHistory = document.querySelector('#tabela-historico');
const inputSearch = document.querySelector('#input-pesquisa');
const buttonSearch = document.querySelector('.submit-pesquisa');
const transactionTitle = document.querySelector('#titulo');
const transactionDescription = document.querySelector('#descricao');

// Selecionando o Input Value
const transactionValue = document.querySelector('#valor');
// Array para armazenar o historico de transações 
const transactionHistory = [];

// Construtor da classe Transação
class Transaction {

    constructor() {
        //Selecionando Elementos do formulário
        this.transactionDate = document.querySelector('#data');
        this.transactionCategory = document.querySelector('#categoria');
        this.transactionType = document.querySelector('#tipo');

        // Elemento de exibição do resultado
        this.transactionResult = document.querySelector('.resultado');

        // Elementos de exibição de valores
        this.pEntry = document.querySelector('.pEntrada');
        this.pBalance = document.querySelector('.pSaldo');
        this.pOutput = document.querySelector('.pSaida');

        this.balance = 0; // Variável para armazenar o saldo
        this.output = 0; // Variável para armazenar o valor total de saídas
        this.entry = 0; // Variável para armazenar o valor total de entradas

        this.historic = null;
        this.displayBalance();
    }

    setHistoric(historic) {
        this.historic = historic;
    }

    // Função para cadastrar a transação
    registerTransaction() {
        const historic = localStorage.getItem('historico');
        //Verifica se já existe já existe um historico no LocalStorage
        const historicTransaction = historic ? JSON.parse(historic) : transactionHistory;
        //Pega o ultimo ID cadastrado e soma 1 para garantir que o ID não se repita
        const newTransaction = historicTransaction[historicTransaction.length - 1];
        const newID = newTransaction ? Number(newTransaction.id) + 1 : 1;

        //Criando campo de identificação único  oculto para cada transação cadastrada 
        const inputId = document.createElement('input');
        inputId.type = 'hidden';
        inputId.name = 'id';
        inputId.value = newID;
        transactionForm.appendChild(inputId);

        // Obtenção dos valores do formulário
        const id = inputId.value;
        const title = transactionTitle.value.trim();
        const description = transactionDescription.value.trim();
        const value = Number(transactionValue.value.trim());
        const date = Transaction.manipuleDate(this.transactionDate.value.trim());
        const category = this.transactionCategory.value.trim();
        const type = this.transactionType.value.trim();

        //Envio dos valores para validação
        this.validateFields(id, title, description, value, date, category, type);
    }

    // Função para validar os campos do formulário
    validateFields(id, title, description, value, date, category, type) {
        let countInvalidFields = 0;

        for (let errorText of transactionForm.querySelectorAll('.error-text')) {
            errorText.remove();
        }

        // Validação do campo título
        if (title === '') {
            transactionTitle.classList.add('campo-invalido');
            verifications.createError(transactionTitle, `Insira um titulo...`);
            countInvalidFields++;
        } else {
            transactionTitle.classList.remove('campo-invalido');
        }

        // Validação do campo Descrição
        if (description === '') {
            transactionDescription.classList.add('campo-invalido');
            verifications.createError(transactionDescription, `Insira uma descrição...`);
            countInvalidFields++;
        } else {
            transactionDescription.classList.remove('campo-invalido');
        }

        // Validação do campo Valor
        if (value === '') {
            transactionValue.classList.add('campo-invalido');
            verifications.createError(transactionValue, `Insira um valor...`);
            countInvalidFields++;
        } else if (value === 0) {
            transactionValue.classList.add('campo-invalido');
            verifications.createError(transactionValue, `O valor não pode ser Zero, insira novamente...`);
            countInvalidFields++;
        } else if (typeof value !== 'number') {
            transactionValue.classList.add('campo-invalido');
            verifications.createError(transactionValue, `O valor precisar ser um número, insira novamente...`);
            countInvalidFields++;
        } else {
            transactionValue.classList.remove('campo-invalido');
        }

        // Validação do campo Data
        const currentDate = new Date();
        const selectDate = new Date(this.transactionDate.value);

        if (this.transactionDate.value === '') {
            this.transactionDate.classList.add('campo-invalido');
            verifications.createError(this.transactionDate, `Selecione uma data...`);
            countInvalidFields++;
        } else if (selectDate > currentDate) {
            this.transactionDate.classList.add('campo-invalido');
            verifications.createError(this.transactionDate, `Não é possivel selecionar uma data futura, tente novamente...`);
            countInvalidFields++;
        } else {
            this.transactionDate.classList.remove('campo-invalido');
        }

        // Validação do campo Categoria
        if (category === '') {
            this.transactionCategory.classList.add('campo-invalido');
            verifications.createError(this.transactionCategory, `Selecione uma categoria...`);
            countInvalidFields++;
        } else {
            this.transactionCategory.classList.remove('campo-invalido');
        }

        // Validação do campo Tipo
        if (type === '') {
            this.transactionType.classList.add('campo-invalido');
            verifications.createError(this.transactionType, `Selecione um tipo de transação...`);
            countInvalidFields++;
        } else {
            this.transactionType.classList.remove('campo-invalido');
        }

        /*
        Checando se existe algum campo inválido, se existir informa para o usuario corrigir,
        se não existir, confirma o cadastro da transação.
        */
        if (countInvalidFields <= 0) {
            transactionHistory.push({ id, title, description, value, date, category, type });
            this.valuesPanel();
            this.historic.saveTransactionHistory();
            transactionForm.reset();
            this.displayBalance();
            alert('Transação cadastrada!');
        }
    }

    // Método responsável por exibir o saldo na interface
    displayBalance() {
        // Obter os valores atuais do saldo, entrada e saída do armazenamento local
        let currentBalance = localStorage.getItem('saldo');
        let entry = localStorage.getItem('entrada');
        let output = localStorage.getItem('saida');

        // Atualizar os elementos HTML para exibir os valores obtidos
        this.pEntry.innerHTML = entry ? `R$ ${parseFloat(entry).toFixed(2)}` : `R$ 0.00`;
        this.pBalance.innerHTML = currentBalance ? `R$ ${parseFloat(currentBalance).toFixed(2)}` : `R$ 0.00`;
        this.pOutput.innerHTML = output ? `R$ ${parseFloat(output).toFixed(2)}` : `R$ 0.00`;
    }

    // Método responsável por gerenciar os gastos
    valuesPanel() {
        // Obter os valores inseridos nos campos do formulário
        let enteredValue = Number(transactionValue.value);
        let type = this.transactionType.value;

        // Obter os valores atuais do saldo, entrada e saída do armazenamento local
        let currentBalance = localStorage.getItem('saldo');
        let currentEntry = localStorage.getItem('entrada');
        let currentOutput = localStorage.getItem('saida');

        // Verificar se os valores atuais existem no armazenamento local e convertê-los para números
        if (currentBalance) this.balance = parseFloat(currentBalance);
        if (currentOutput) this.output = parseFloat(currentOutput);
        if (currentEntry) this.entry = parseFloat(currentEntry);

        // Atualizar os valores com base no tipo de transação selecionado
        if (type === 'Entrada') {
            this.entry += enteredValue
            this.balance += enteredValue

            // Atualizar o elemento HTML da entrada e armazenar o novo valor
            this.pEntry.innerHTML = `R$ ${this.entry.toFixed(2)}`;
            localStorage.setItem('entrada', this.entry);
        } else if (type === 'Saida') {
            this.balance -= enteredValue;
            this.output += enteredValue;

            // Atualizar o elemento HTML da saída e armazenar o novo valor
            this.pOutput.innerHTML = `R$ ${this.output.toFixed(2)}`;
            localStorage.setItem('saida', this.output);
        }

        // Atualizar o elemento HTML do saldo e armazenar o novo valor
        this.pBalance.innerHTML = `R$ ${this.balance.toFixed(2)}`;
        localStorage.setItem('saldo', this.balance);
    }

    // Função responsável por manipular a data selecionada
    static manipuleDate(date) {
        // Criar um novo objeto Date com a data selecionada
        let dateObj = new Date(date);

        // Obter o deslocamento do fuso horário atual em minutos
        const deslocamentoFusoHorario = dateObj.getTimezoneOffset();

        // Adicionar o deslocamento do fuso horário à data
        dateObj.setMinutes(dateObj.getMinutes() + deslocamentoFusoHorario);

        // Formatando a data para o padrão desejado (dd/mm/yyyy)
        const dia = String(dateObj.getUTCDate()).padStart(2, '0');
        const mes = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
        const ano = dateObj.getUTCFullYear();

        return `${dia}/${mes}/${ano}`;
    }
}

// Construtor da classe Historico
class Historic {

    constructor() {
        this.transaction = null;
        // Selecionando o tbody da tabela 
        this.tbody = document.querySelector('#tbody-historico');
        // Verifica se o elemento tbody existe
        if (this.tbody) {
            this.displayHistory();
            this.deleteButton();
        }
    }

    setTransaction(transaction) {
        this.transaction = transaction;
    }

    // Função para salvar a transação no histórico
    saveTransactionHistory() {
        const historic = localStorage.getItem('historico');

        // Se já existir um histórico, converte para objeto e adiciona a transação mais recente
        if (historic) {
            const novoHistoric = JSON.parse(historic);
            novoHistoric.push(transactionHistory[transactionHistory.length - 1]);
            const historicJSON = JSON.stringify(novoHistoric);
            localStorage.setItem('historico', historicJSON);
        } else {
            // Se não existir um histórico, cria um novo com a transação atual
            const historicJSON = JSON.stringify(transactionHistory);
            localStorage.setItem('historico', historicJSON);
        }
    }

    // Função para atualizar o painel de gastos com base no histórico
    updateValuesPanel() {
        const browserHistoryJSON = localStorage.getItem('historico');
        const historicJSON = JSON.parse(browserHistoryJSON);

        let valueOut = 0;
        let entryValue = 0;

        // Percorre o histórico e calcula os valores de saída e entrada
        for (const value of historicJSON) {
            if (value.type === 'Saida') {
                valueOut += value.value;
            } else if (value.type === 'Entrada') {
                entryValue += value.value;
            }
        }

        // Calcula o saldo com base nos valores de entrada e saída
        const balanceValue = entryValue - valueOut;

        // Atualiza os valores de saldo, entrada e saída no armazenamento local
        localStorage.setItem('saldo', balanceValue);
        localStorage.setItem('entrada', entryValue);
        localStorage.setItem('saida', valueOut);

        this.transaction.displayBalance();
    }

    // Função para exibir o histórico na tabela
    displayHistory() {
        const historic = localStorage.getItem('historico');
        if (!historic) return;

        const historicTransactionJSON = JSON.parse(historic);

        // Percorre o histórico de transações e cria as linhas da tabela
        for (let i = 0; i < historicTransactionJSON.length; i++) {
            const item = historicTransactionJSON[i];
            const tr = document.createElement('tr');
            tr.setAttribute('data-id', item.id);
            const tdTitle = document.createElement('td');
            const tdDescription = document.createElement('td');
            const tdCategory = document.createElement('td');
            const tdValue = document.createElement('td');
            const tdDate = document.createElement('td');
            const tdtype = document.createElement('td');
            const tdDeleteButton = document.createElement('td');

            const deleteButton = document.createElement('button');
            deleteButton.setAttribute('class', 'apagar');

            // Preenche as células da linha com os valores da transação
            tdTitle.innerText = item.title;
            tdDescription.innerText = item.description;
            tdCategory.innerText = item.category;
            tdValue.innerText = `R$ ${parseFloat(item.value).toFixed(2)}`;
            tdDate.innerText = item.date;
            tdtype.innerText = item.type;
            deleteButton.innerText = 'X';
            tdDeleteButton.appendChild(deleteButton);

            // Adiciona as células à linha
            tr.appendChild(tdTitle);
            tr.appendChild(tdDescription);
            tr.appendChild(tdCategory);
            tr.appendChild(tdValue);
            tr.appendChild(tdDate);
            tr.appendChild(tdtype);
            tr.appendChild(tdDeleteButton);

            // Adiciona a linha à tabela
            this.tbody.appendChild(tr);
        }
    }

    // Função para lidar com o clique no botão de apagar transação
    deleteButton() {
        document.addEventListener('click', (e) => {
            const el = e.target
            //Verifica se o Elemento clicado tem a classe "Apagar"
            if (el.classList.contains('apagar')) {
                const tr = el.parentNode.parentNode;
                const id = tr.dataset.id;

                //Deleta toda a linha referente ao botão clicado 
                tr.remove();

                // Atualiza o histórico no localStorage excluindo o objeto com o ID correspondente
                const historicJSON = JSON.parse(localStorage.getItem('historico'));
                const newHistoric = historicJSON.filter(objeto => objeto.id !== id);
                localStorage.setItem('historico', JSON.stringify(newHistoric));

                //Atualiza o painel de exibição do saldo
                this.updateValuesPanel();
            }
        })
    }
}

// Construtor da classe de Verificações
class Verifications {
    // Verifica e formata o valor do campo "Valor"
    verifyInputValue(e) {
        let input = e.target;
        let value = input.value;
        // remove espaços em branco
        value = value.replace(/\s/g, '');
        // remove caracteres não numéricos
        value = value.replace(/[^\d.]/g, '');
        // verifica se o valor já contém um ponto decimal
        if (value.indexOf('.') !== -1) {
            const parts = value.split('.');
            // se houver mais de uma parte após o ponto, mantém apenas a primeira parte
            if (parts.length > 2) {
                value = parts[0] + '.' + parts[1];
            }
        }
        // atualiza o valor do campo
        input.value = value;
    }
    
    // Verifica e limita os caracteres do campo "Titulo"
    verifyInputTitle(e) {
        let input = e.target;
        let value = input.value;

        if (value.length > 25) {
            value = value.substring(0, 25).split(" ");
            value = value.join(" ");
        }
        // atualiza o valor do campo
        input.value = value;
    }
    
    // Verifica e formata o valor do campo "Descrição"
    verifyInputDescription(e) {
        let input = e.target;
        let value = input.value;

        if (value.length > 60) {
            value = value.substring(0, 60).split(" ");
            value = value.join(" ");
        }
        // atualiza o valor do campo
        input.value = value;
    }

    /* Verifica se existe alguma linha na tabela, se existir mostra a tabela, 
    se não, informa que não tem transação cadastrada*/
    verifyContentTable() {
        const divTableHistory = document.querySelector('.container-table');
        const messageTableNull = document.querySelector('.mensagem');
        if (tableHistory.rows.length > 1) {
            tableHistory.style.display = 'table';
            messageTableNull.style.display = 'none';
        } else {
            tableHistory.style.display = 'none';
            divTableHistory.style.display = 'none';
            messageTableNull.style.display = 'inherit';
        }
    }
    // Cria uma div especifica para mostrar erros no formluario de cadastro de uma nova transação
    createError(campo, msg) {
        const div = document.createElement('div');
        div.innerHTML = msg;
        div.classList.add('error-text');
        campo.insertAdjacentElement('afterend', div);
    }

}

// Construtor da classe de Pesquisa
class Search {

    //Remove todos os acentos do texto, para padronizar o texto de pesquisa
    static removerAcentos(texto) {
        return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    pesquisar() {
        
        // Obter o valor de pesquisa do input, e a categoria escolhida
        const research = Search.removerAcentos(inputSearch.value.toLowerCase());
        const categorySearch = document.querySelector('#pesquisar-categoria').value;

        // Obter todas as linhas da tabela
        const linhas = tableHistory.getElementsByTagName('tr');

        // Iterar sobre as linhas e ocultar aquelas que não correspondem à pesquisa
        for (let i = 1; i < linhas.length; i++) { // Começar a partir de 1 para ignorar o cabeçalho da tabela
            let coluna; 

            // Associando cada coluna da tabela, a um índice do array, para o usuario poder realizar buscas específicas
            if (categorySearch === 'titulo') coluna = linhas[i].getElementsByTagName('td')[0];
            if (categorySearch === 'descricao') coluna = linhas[i].getElementsByTagName('td')[1];
            if (categorySearch === 'categoria') coluna = linhas[i].getElementsByTagName('td')[2];
            if (categorySearch === 'valor') coluna = linhas[i].getElementsByTagName('td')[3];
            if (categorySearch === 'data') coluna = linhas[i].getElementsByTagName('td')[4];
            if (categorySearch === 'tipo') coluna = linhas[i].getElementsByTagName('td')[5];

            /*Verifica se existe coluna, se existir vai fazer a comparação da pesquisa com o valor da coluna
            especifica da categoria escolhida, e mostra somente as linhas que correspondem a pesquisa */
            if (coluna) {
                let valorColuna = Search.removerAcentos(coluna.innerText);
                if (valorColuna.toLowerCase().indexOf(research) > -1) {
                    linhas[i].style.display = '';
                } else {
                    linhas[i].style.display = 'none';
                }
            }
        }
    }
}

// Criação das instâncias das classes Transaction, Historic, Verifications e Search
const transaction = new Transaction();
const historic = new Historic();
const verifications = new Verifications();
const search = new Search();

// Estabelecendo as referências entre as classes
historic.setTransaction(transaction);
transaction.setHistoric(historic);

// Verifica se existe a Tabela de Historico 'tableHistory'
if (tableHistory) {

    buttonSearch.addEventListener('click', () => {
            search.pesquisar();
    });

    inputSearch.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            search.pesquisar();
        }
    });

    window.addEventListener('DOMContentLoaded', () => {
        verifications.verifyContentTable();

        let observer = new MutationObserver(function () {
            verifications.verifyContentTable();
        });

        // Configurar as opções do observer
        let observerConfig = {
            childList: true, // Observar mudanças nos filhos da tabela
            subtree: true // Observar mudanças em todos os elementos descendentes da tabela
        };

        // Iniciar a observação da tabela
        observer.observe(tableHistory, observerConfig);
    });
}

// Verifica se existe o Formulário de cadastro 'transactionForm'
if (transactionForm) {
    // Adiciona um ouvinte de evento para o evento de envio do formulário ('submit')
    transactionForm.addEventListener('submit', (e) => {
        // Prevenção do comportamento padrão do formulário
        e.preventDefault();
        // Chama a função 'startRegistration()' do objeto 'Transaction' para lidar com o cadastro da transação
        transaction.registerTransaction();
    });

    // Verifica se o Input 'Value' contem apenas números
    transactionValue.addEventListener('input', verifications.verifyInputValue);
    // LImita o Input 'Title' a uma quantidade X de caracteres 
    transactionTitle.addEventListener("input", verifications.verifyInputTitle);
    // LImita o Input 'Description' a uma quantidade X de caracteres 
    transactionDescription.addEventListener("input", verifications.verifyInputDescription);
};