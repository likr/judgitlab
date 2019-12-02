import React from 'react'
import * as d3 from 'd3'
class Chart extends React.Component {
    constructor(props) {
      super(props);
      this.state={
        filterKeyword : '',
        policy : '',
        hideMinistries : new Set(),
        transform : {x:0,y:0,k:1}
      };
      this.zoom = d3.zoom()
      .on('zoom',()=>{
        const {x,y,k} = d3.event.transform
        this.setState({transform:{x,y,k}})
      })
    }
    componentDidMount(){
      d3.select(this.refs.ff14).call(this.zoom)
    }
  
    render() {
        const data = this.props.data
        console.log(this.state.filterKeyword)
        console.log(data)
        const ministries = new Set()
        for(const node of data){
          ministries.add(node['府省庁'])
        }
        console.log(ministries)
        const policies = new Set()
        for(const node of data){
          policies.add(node['主要政策・施策'])
        }
        console.log(policies)
        const ministryIndex = new Map(
          Array.from(ministries).map((ministry,i)=>[ministry,i])
        )
        console.log(ministryIndex)
        for (const node of data){
          const index = ministryIndex.get(node['府省庁'])
          node.fillColor = d3.hsl(360*(index/ministries.size),0.5,0.5,0.6).toString()
        }
  
        const width = 1600
        const height = 900
        const textMargin = 100
        const labelMargin = 1100
        const xScale = d3.scaleLinear()
        .domain(d3.extent(data, (item) => item.x))
        .range([-400, 400])
        .nice()
        const yScale = d3.scaleLinear()
        .domain(d3.extent(data, (item) => item.y))
        .range([400, -400])
        .nice() 
        const moneyScale = d3.scaleLog()
        .domain(d3.extent(data, (item) => (parseInt(item['29年度執行額'])+10)))
        .base(10)
        .range([0, 15])
        .nice()
  
        return (
          <div>
            <div className='refine'>
              <form onSubmit={(event)=>{
                  event.preventDefault()
                  this.setState({filterKeyword:this.refs.search.value})
                }}
                >
                <input ref='search'>
                </input>
                <button>絞り込み
                </button>
              </form>
            </div>
            <div className='refine'>
              <div>
                <b>主要政策・施策 : </b>
                <select name="select" id="select" defalutValue="" onChange ={(event)=>{this.setState({policy:event.target.value})}}>
                  <option value="">ALL</option>
                  <option value="高齢社会対策">高齢社会対策</option>
                  <option value="男女共同参画">男女共同参画</option>
                  <option value="少子化社会対策">少子化社会対策</option>
                  <option value="子ども・若者育成支援">子ども・若者育成支援</option>
                  <option value="国土強靱化施策">国土強靱化施策</option>
                  <option value="障害者施策">障害者施策</option>
                  <option value="地方創生">地方創生</option>
                  <option value="科学技術・イノベーション">科学技術・イノベーション</option>
                  <option value="ＩＴ戦略">ＩＴ戦略</option>
                  <option value="一億総活躍推進">一億総活躍推進</option>
                  <option value="海洋政策">海洋政策</option>
                  <option value="観光立国">観光立国</option>
                  <option value="宇宙開発利用">宇宙開発利用</option>
                  <option value="地球温暖化対策">地球温暖化対策</option>
                  <option value="ＯＤＡ">ＯＤＡ</option>
                  <option value="自殺対策">自殺対策</option>
                  <option value="医療分野の研究開発関連">医療分野の研究開発関連</option>
                  <option value="沖縄振興">沖縄振興</option>
                  <option value="知的財産">知的財産</option>
                  <option value="2020年東京オリパラ">2020年東京オリパラ</option>
                  <option value="犯罪被害者等施策">犯罪被害者等施策</option>
                  <option value="クールジャパン">クールジャパン</option>
                  <option value="食育推進">食育推進</option>
                </select>
              </div>
            </div>
            <svg style = {{cursor:'move'}}ref = 'ff14' viewBox= {`0 0 ${width} ${height}`}>
              <rect x="1" y="1" width={width-2} height={height-2}
                fill="none" stroke="blue" stroke-width="2" />
              <g transform = {`translate(1400,0)`}>
                <text x={0} y={76}>(千万円)</text>
                {
                  moneyScale.ticks(7).map((m,i)=>{ 
                    return <g>
                      <circle 
                        cx={0} cy={`${i*30+textMargin}`}
                        r={moneyScale(m)}
                        fill='black'
                        />
                      <text x={20}y={`${i*30+textMargin+6}`}>{m/10}</text>
                    </g>
                  })
                }
              </g>
              <g transform = {`translate(1100,0)`}>
                <g style = {{cursor:'pointer'}}onClick={()=>{  
                    if(this.state.hideMinistries.size === 0){
                      this.setState({hideMinistries:new Set(ministries)})
                    }else{
                      this.setState({hideMinistries:new Set()})
                    }}}>
                  <text x={0} y={`${-1*30+textMargin+6}`}>(府省庁)</text>
                </g>
                {
                  Array.from(ministries).map((ministry,i)=>{
                    return <g key = {i} style = {{cursor:'pointer'}}onClick={()=>{
                        const newSet = new Set(this.state.hideMinistries)
                        if(newSet.has(ministry)){
                          newSet.delete(ministry)
                        }else{
                          newSet.add(ministry)
                        }
                        this.setState({hideMinistries:newSet})
                      }}
                             >
                      <circle 
                        cx={0} cy={`${i*30+textMargin}`}
                        r='10'
                        fill={d3.hsl(360*(i/20),0.5,0.5,0.6)}
                        />
                      <text x={10}y={`${i*30+textMargin+6}`}>{ministry}</text>
                    </g>
                  })
                }
              </g>
  
              <g transform = {`translate(${this.state.transform.x},${this.state.transform.y})scale(${this.state.transform.k})`}>
                <g>
                  {
                    data.filter((v,cnt)=>{
                      return(
                        !this.state.hideMinistries.has(v['府省庁'])
                      )
                    }).filter((v,i)=>{
                      if(v['事業名'].includes(this.state.filterKeyword)===true){
                        return true
                      }
                      else{
                        return false
                      }
                    }).filter((v,i)=>{
                      if(v['主要政策・施策'].includes(this.state.policy)===true){
                        return true
                      }
                      else{
                        return false
                      }
                    }).map((v,i)=>{
                      return <g key={i} transform = {`translate(500,${height/2})`}>
                        <title>
                          {v['主要政策・施策']+','}
                          {v['事業名']+','}
                          {parseInt(v['29年度執行額'])/10}
                        </title>
                        <circle style = {{cursor:'pointer'}}
                          // cx={xScale(v.x)} cy={yScale(v.y)} 
                          cx={v.x*7} cy={v.y*7}
                          r={moneyScale(parseInt(v['29年度執行額'])+10)}
                          // r='3'
                          fill={v.fillColor}
                          />
                      </g>
                    })
                  }
                </g>
              </g>
            </svg>
          </div>
        );
      
    }
  }
  
  class App extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        data: null
      };
    }
  
    componentDidMount() {
      const url =
        "https://raw.githubusercontent.com/t-taiki0620/GE/master/tsne.json";
      window
        .fetch(url)
        .then(response => response.json())
        .then(data => {
          this.setState({ data });
        });
    }
  
    render() {
      const { data } = this.state;
      return (
        <>
          <section className="section">
            <div className="container">
              <div className="content has-text-centered">
                <h3>2019年度尾上ゼミ 情報科学研究1 課題制作</h3>
                <h1>文章類似度から見た行政事業の関連度</h1>
                <h4 className='up'>データの説明</h4>
                <p align="left" className='new_line'>
                  今回使用したデータは国が出している行政事業レビューシートの2018年度版のものをグラフ化したものです。<br />
                  色が府省庁、大きさが事業の2017年度の執行額を表しています。</p>
                <h4 className='up'>可視化の説明</h4>
                <p align="left" className='new_line'>
                  Reactを用いて作成しました。<br />
                  文章間の類似度を計測できるdoc2vecを利用して行政事業レビューシート内のそれぞれの事業概要の文章類似度を測定しました。<br />
                  doc2vecの利用にはPythonライブラリのgensimを用いました。<br />
                  また文章を書き出したとき、英語などと違い、日本語は文章が単語に分かれていません。<br />
                  そのため日本語の文章の類似度を測定する際には文章を単語ごとに分かち書きする必要があります。<br />
                  それにはすでに日本語版wikipediaの文章を学習させたdoc2vevのモデルがあったため、そちらを利用しました。<br />
                  こうして出来上がったデータをそのままネットワーク化しグラフにした際、あまり良い考察の得られる可視化ではなかったためtsneを用いて次元を削減しより見やすいデータにして可視化しました。
                </p>
                <div style={{ margin: "2em" }}>
                  {data&&
                    <Chart data={data} />
                    }
                </div>
                <h4 className='up'>可視化結果の考察</h4>
                <p align="left" className='new_line'>
                  分布を見ると厚生労働省などの広く分布しているものと右上、右下にある外務省や防衛省広く散布している中でも事業によっては集中しているものがあるのがわかります。<br />
                  またその集中している事業のなかに先程の広く散布されている省庁のものがあります。<br />
                  こういった事業は違う省庁でありながら似たような事業を行っている可能性があります。<br />
                  また執行額から見ると多くの事業がほぼ変わらないのがわかります。<br />
                  その中で厚生労働省の2つの事業が飛び抜けて多く使っているのがわかります<br />
                </p>
              </div>
            </div>
          </section>
          <footer className="footer">
            <div className="content has-text-centered">
              <p>&copy;2019 田中 太樹</p>
            </div>
          </footer>
        </>
      );
    }
  }
  
  class Root extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        error: null
      };
    }
  
    static getDerivedStateFromError(error) {
      return { error };
    }
  
    componentDidCatch(error, info) {
      console.error(error.toString());
    }
  
    render() {
      const { error } = this.state;
      if (error != null) {
        return (
          <div className="hero is-danger is-fullheight">
            <div class="hero-body">
              <div class="container">
                <h1 class="title">{error.toString()}</h1>
              </div>
            </div>
          </div>
        );
      }
      return <App />;
    }
  }
  
//   (async () => {
//     await egraph(
//       "https://s3-us-west-2.amazonaws.com/s.cdpn.io/2004014/egraph_wasm_bg.wasm"
//     );
//     ReactDOM.render(<Root />, document.getElementById("root"));
//   })();
export default Root