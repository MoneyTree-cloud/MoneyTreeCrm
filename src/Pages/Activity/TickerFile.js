import Ticker from "react-ticker";
import Logo from "../../assets/images/Tree_transparent.png";
import { useGet } from "../../Hooks/useApi";
import { GET_ALL_TICKER_DATA } from "../../helpers/url_helper";

const colors = [
  "#c38c42", // Gold
  "#FF4500", // Orange Red
  "#1E90FF", // Dodger Blue
  "#32CD32", // Lime Green
  "#FF69B4", // Hot Pink
];

const styles = {
  container: {
    backgroundColor: "black",
    padding: "8px",
    borderRadius: "10px",
    marginBottom: "20px",
    marginTop: "-15px",
  },
  tickerItem: {
    display: "flex",
    alignItems: "center",
  },
  message: (color) => ({
    marginRight: "10px",
    color: color,
    fontSize: 15,
    fontWeight: 'bold'
  }),
  logo: {
    width: "30px",
    height: "30px",
  },
};

const TickerFile = () => {
  const { data: tickerData } = useGet(GET_ALL_TICKER_DATA);
  const tickerList = tickerData ? tickerData?.data?.data : [];
  const activeTickers =
    tickerList?.length > 0
      ? tickerList?.filter((ticker) => ticker.isActive === "YES")
      : [];

  if (activeTickers.length === 0) {
    return null;
  }

  return (
    <div style={styles.container}>
      <Ticker>
        {({ index }) => {
          const tickerMessage =
            activeTickers[index % activeTickers?.length]?.tickerName || "";
          return (
            <div style={styles.tickerItem}>
              <h1 style={styles.message(colors[index % colors.length])}>
                {'\u00A0'}{'\u00A0'}{tickerMessage}{'\u00A0'}{'\u00A0'}
              </h1>
              <img src={Logo} alt="Tree Logo" style={styles.logo} />
            </div>
          );
        }}
      </Ticker>
    </div>
  );
};

export default TickerFile;