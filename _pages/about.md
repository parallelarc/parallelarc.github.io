---
# layout: archive
permalink: /
title: ""
author_profile: true
redirect_from: 
  - /about/
  - /about.html
---

Hi, I am a research assistant in [MARS Lab](http://group.iiis.tsinghua.edu.cn/~marslab/) at IIIS, Tsinghua University, working with [Prof. Hang Zhao](https://hangzhaomit.github.io/). My research interests lie at the intersection of artificial intelligence and computer vision, with a particular focus on **generative models, autonomous driving, and multi-modal machine learning**.


I was an intern at Xiaomi EV, working with Dr. Guang Li and [Dr. Kuiyuan Yang](https://scholar.google.com/citations?user=g2gAY_0AAAAJ), and during which I secured 2nd place in the Mapless Driving track of the CVPR2024 [Autonomous Grand Challenge](https://opendrivelab.com/challenge2024/#mapless_driving). 


I earned my MEng (2024) from [Beijing University of Posts and Telecommunications (BUPT)](https://www.bupt.edu.cn) and my BEng (2021) with a UK First Class Honours Degree from the joint program between BUPT and [Queen Mary University of London (QMUL)](https://www.qmul.ac.uk/). I am fortunate to have received recommendation letters from Dr. Kuiyuan Yang and [Pres. Kun XU](https://www.bupt.edu.cn/info/1274/84949.htm) of BUPT.

:fire: **I'm actively on the hunt for a PhD opportunity. Should you come across any promising leads, I'd be delighted to hear from you. My [CV](/files/CV_JianweiREN.pdf), [research statement](/files/Research_Statement.pdf) and [research proposal](/files/RP.pdf) are available.**

<hr>

# Research

<style>
.pub {
  display: flex; 
  margin-top: 3.5%;
  margin-bottom: 5%;
  height: 7%;
  flex-wrap: wrap;
}

.pub .img {
  display: flex;
  flex: 1;
  margin-right: 20px;
  align-items: center;
}

.pub .img img{
  box-shadow: 3px 3px 6px #888;
  border-radius: 8px;
  object-fit: contain;
  height: 120px;
  width: 180px;
  margin-top: 5px;
  margin-left: 5px;
  margin-bottom: 5px;
}

.pub .txt {
  flex: 0 0 75%;
  max-width: 75%;
}

.pub h2 {
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 0;
}

.pub p {
  font-size: 14px;
  margin-top: 0;
  margin-bottom: 0;
}
</style>


<div class="pub">
  <div class="img">
    <img src="/images/pub/pub1.png">
  </div>
  <div class="txt">
    <h2>
      <b><a href="https://opendrivelab.github.io/Challenge%202024/mapless_XIAOMIEV.pdf">Leveraging SD Map to Assist the OpenLane Topology</a></b>
    </h2>
    <p>Guang Li*, <b>Jianwei Ren*</b>, Quanyun Zhou, Anbin Xiong, Kuiyuan Yang <br>
      <b>CVPR Workshop, 2024</b><br>
      This is a technical report for Mapless Driving, achieving 2nd place on the OpenLane-V2 leaderboard. A "lane-crosswalk-boundary" joint training framework is adopted to detect vectorized traffic elements, demonstrating that employing appropriate representations for traffic elements and incorporating SD map into BEV generation significantly enhance performance. Additionally, a YOLOv8-based multi-scale framework is employed for detecting traffic signs. We also introduce geometric priors to refine topological modeling, achieving state-of-the-art results.
    </p>
  </div>
</div>

<div class="pub">
  <div class="img">
    <img src="/images/pub/pub3.png">
  </div>
  <div class="txt">
    <h2>
      <b><a href="">SimPix: Simple Pixel-wise Representation Alignment for Self-supervised Monocular Depth Estimation</a></b>
    </h2>
    <p><b>Jianwei Ren</b><br>
      <b>One Chapter of Master Thesis </b><br>
      This is a simple pixel-wise representation learning framework for self-supervised monocular depth estimation. It explicitly constructs a knowledge transfer path between the original frame and reconstructed frame, enabling its siamese weight-sharing encoders to extract scene-invariant features. SimPix achieves competitive results with state-of-the-art without increasing the complexity during inference.
      
    </p>
  </div>
</div>

<div class="pub">
  <div class="img">
    <img src="/images/pub/pub2.png">
  </div>
  <div class="txt">
    <h2>
      <b><a href="https://arxiv.org/abs/2404.03190">Adaptive Discrete Disparity Volume for Self-supervised Monocular Depth Estimation</a></b>
    </h2>
    <p><b>Jianwei Ren</b><br>
      <b>ArXiv, 2024</b><br>
      This is the first work to introduce adaptive discrete strategy into the self-supervised monocular depth estimation community. Through global perception of distinct scenes, a learnable module is designed to dynamically allocate pixels into bins with adaptive depth values. To prevent collapse due to the absence of supervision, a regularization is proposed to encourage a uniform distribution of samples overall. Empirical results underscore that adaptive methods retain superiority to conventional handcrafted strategies even without supervision.
    </p>
  </div>
</div>



