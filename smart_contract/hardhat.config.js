require("@nomiclabs/hardhat-waffle");
require("dotenv").config();

module.exports = {
  solidity: "0.8.0",
  networks: {
    mumbai: {
      url: "https://polygon-mumbai.g.alchemy.com/v2/W8M2vgXMA75Pg4SqvdptWJ_vih8iNCBE",
      accounts: [process.env.MUMBAI_PRIVATE_KEY],
      chainId: 80001,
    },
  },
};
