import React from 'react';

const xx = () => {
    const a2 = '全球收款\n极速结汇\n安全风控'
    const obj = { test: '基础版永久免费；会员版998元/年，\n价格<相似产品5%！' };
    const shareData = {
      title: '免7.5W结汇额度手续费，立即开启跨境收款！',
      link: `${a2}://`,
      desc: '全球收款 极速结汇 安全风控',
      imgUrl: `${a2}/images/figure/thumbnail.png`,
    }
    return <>
        <div className={styles.record}>{'©XTransfer. All rights reserved.\n沪ICP备17023308号'}</div>
		<p>
			该使用条款（和由此引起或与之相关的任何非合同义务）应受英格兰法律的约束并根据其进行解释；英格兰法院应拥有专属管辖权，以解决与该使用条款和/或本协议项下所提供服务（包括与任何非合同义务相关的服务）相关的任何争端或索赔。但是，如果业务介绍人已经将您介绍给我们且您是消费者，则
			(a) 如果您居住在苏格兰，您可在苏格兰法院或英国法院提起与该服务有关的法律诉讼；并且 (b)
			如果您居住在北爱尔兰，您可以在北爱尔兰法院或英国法院就该服务提起法律诉讼。此外，如果您是消费者，可向欧盟委员会在线争议解决平台提交争议，以在线进行解决；网址为
			https://ec.europa.eu/consumers/odr。
		</p>
    </>
}