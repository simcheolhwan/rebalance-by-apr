import { useState } from "react"
import { useQuery } from "react-query"
import { request, gql } from "graphql-request"
import BigNumber from "bignumber.js"
import numeral from "numeral"

interface Dictionary<A> {
  [key: string]: A
}

const c = 0.25

const picked = [
  "MIR",
  "mAAPL",
  "mABNB",
  "mAMZN",
  "mBTC",
  "mETH",
  "mFB",
  "mGOOGL",
  "mGS",
  "mIAU",
  "mMSFT",
  "mNFLX",
  "mQQQ",
  "mSLV",
  "mTSLA",
  "mUSO",
]

const getImage = (symbol: string) => {
  const ticker = symbol.replace("m", "")
  return `https://whitelist.mirror.finance/images/${ticker}.png`
}

const Table = ({ data }: { data: Asset[] }) => {
  const initial = data.reduce(
    (acc, { symbol }) => ({ ...acc, [symbol]: picked.includes(symbol) }),
    {}
  )

  const [total, setTotal] = useState("100000")
  const [checked, setChecked] = useState<Dictionary<boolean>>(initial)

  const checkedAssets = data.filter(({ symbol }) => checked[symbol])
  const totalAPR = BigNumber.sum(...checkedAssets.map(({ apr }) => apr))

  return (
    <>
      <input value={total} onChange={(e) => setTotal(e.target.value)} />
      <table>
        <tbody>
          {data.map(({ symbol, apr }) => {
            const isChecked = checked[symbol]
            const balance = new BigNumber(total).times(apr).div(totalAPR)

            return (
              <tr key={symbol}>
                <td>
                  <img src={getImage(symbol)} alt={symbol} width={16} />
                </td>

                <th>{symbol}</th>

                <td>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      setChecked({ ...checked, [symbol]: !isChecked })
                    }
                  />
                </td>

                <td>{percent(apr)}</td>

                {isChecked && total && (
                  <>
                    <td>{balance.integerValue().toNumber()}</td>
                    <td>{balance.div(2).integerValue().toNumber()}</td>
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}

const APR = () => {
  const { data } = useAPR()
  return !data ? null : (
    <Table
      data={data.map((item) => {
        const apr = new BigNumber(item.apr)
          .div(c)
          .integerValue()
          .times(c)
          .toString()

        return { ...item, apr }
      })}
    />
  )
}

export default APR

/* query */
const QUERY = gql`
  query {
    assets {
      symbol
      statistic {
        apr
      }
    }
  }
`

const endpoint = "https://graph.mirror.finance/graphql"

interface AssetData {
  symbol: string
  statistic: { apr: string }
}

interface Asset {
  symbol: string
  apr: string
}

const useAPR = () => {
  return useQuery("apr", async () => {
    const { assets } = await request<{ assets: AssetData[] }>(endpoint, QUERY)
    return assets
      .map(({ symbol, statistic: { apr } }) => ({ symbol, apr }))
      .sort(({ apr: a }, { apr: b }) => new BigNumber(b).minus(a).toNumber())
  })
}

/* utils */
const percent = (n: any) => numeral(n).format("0%")
