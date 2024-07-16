const contractAddress = 'YOUR_CONTRACT_ADDRESS';
const contractABI = [/* Your contract ABI*/];

let web3;
let contract;
let accounts;

window.addEventListener('load', async () => {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        try {
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            accounts = await web3.eth.getAccounts();
            document.getElementById('walletAddress').innerText = accounts[0];
            contract = new web3.eth.Contract(contractABI, contractAddress);
        } catch (error) {
            console.error("User denied account access");
        }
    } else {
        alert('Please install MetaMask!');
    }

    document.getElementById('connectWalletButton').addEventListener('click', connectWallet);
    document.getElementById('createProposalButton').addEventListener('click', createProposal);
    loadProposals();
});

async function connectWallet() {
    const feedbackMessage = document.getElementById('feedbackMessage');
    if (window.ethereum) {
        try {
            feedbackMessage.innerText = "Connecting to wallet...";
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            accounts = await web3.eth.getAccounts();
            document.getElementById('walletAddress').innerText = accounts[0];
            feedbackMessage.innerText = "Wallet connected successfully!";
        } catch (error) {
            if (error.code === 4001) {
                console.error("User rejected the request.");
                feedbackMessage.innerText = "Please connect your wallet to use this application.";
            } else {
                console.error("An unexpected error occurred:", error);
                feedbackMessage.innerText = "An error occurred. Please try again.";
            }
        }
    } else {
        feedbackMessage.innerText = 'Please install MetaMask!';
    }
}



async function createProposal() {
    const description = document.getElementById('proposalDescription').value;
    if (!description) {
        alert('Please enter a proposal description');
        return;
    }

    try {
        await contract.methods.createProposal(description).send({ from: accounts[0] });
        loadProposals();
    } catch (error) {
        console.error(error);
    }
}

async function loadProposals() {
    const proposalCount = await contract.methods.proposalCount().call();
    const proposalsList = document.getElementById('proposalsList');
    proposalsList.innerHTML = '';

    for (let i = 1; i <= proposalCount; i++) {
        const proposal = await contract.methods.proposals(i).call();
        const proposalElement = document.createElement('div');
        proposalElement.className = 'proposal';
        proposalElement.innerHTML = `
            <p><strong>ID:</strong> ${proposal.id}</p>
            <p><strong>Proposer:</strong> ${proposal.proposer}</p>
            <p><strong>Description:</strong> ${proposal.description}</p>
            <p><strong>Votes:</strong> ${proposal.voteCount}</p>
            <p><strong>End Time:</strong> ${new Date(proposal.endTime * 1000).toLocaleString()}</p>
            <button onclick="vote(${proposal.id}, true)">Support</button>
            <button onclick="vote(${proposal.id}, false)">Oppose</button>
            <button onclick="executeProposal(${proposal.id})">Execute</button>
        `;
        proposalsList.appendChild(proposalElement);
    }
}

async function vote(proposalId, support) {
    try {
        await contract.methods.vote(proposalId, support).send({ from: accounts[0] });
        loadProposals();
    } catch (error) {
        console.error(error);
    }
}

async function executeProposal(proposalId) {
    try {
        await contract.methods.executeProposal(proposalId).send({ from: accounts[0] });
        loadProposals();
    } catch (error) {
        console.error(error);
    }
}
