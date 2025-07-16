import { fetchHelloWorld } from '../../services/data.service.js';

const imoController = () => {
  const getHello = (_, res) => {
    fetchHelloWorld()
      .then((data) => {
        if (!data) {
          throw new Error('Something went wrong!');
        }

        return res.json(data);
      })
      .catch((err) => {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong!' })
      });
  };

  return {
    getHello,
  };
};

export default imoController;