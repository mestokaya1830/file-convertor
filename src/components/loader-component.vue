<template>
  <div>
    <div class="spinner">
    <div class="rect1"></div>
    <div class="rect2"></div>
    <div class="rect3"></div>
    <div class="rect4"></div>
    <div class="rect5"></div>
    <div class="rect6"></div>
  </div>
  </div>
</template>

<style scoped>
.spinner {
  display: flex;
  max-width: 60px;
  height: 50px;
  text-align: center;
}

.spinner > div {
  background-color: seagreen;
  height: 100%;
  min-width: 5px;
  max-width: 5px;
  display: inline-block;
  -webkit-animation: sk-stretchdelay 0.5s infinite ease-in-out;
  animation: sk-stretchdelay 1s infinite ease-in-out;
  border-radius: 3px;
  margin: 0 2px;
}

.spinner .rect1 {
  -webkit-animation-delay: -1.1s;
  animation-delay: -1.1s;
}
.spinner .rect2 {
  -webkit-animation-delay: -1.0s;
  animation-delay: -1.0s;
}

.spinner .rect3 {
  -webkit-animation-delay: -0.9s;
  animation-delay: -0.9s;
}

.spinner .rect4 {
  -webkit-animation-delay: -0.8s;
  animation-delay: -0.8s;
}

.spinner .rect5 {
  -webkit-animation-delay: -0.7s;
  animation-delay: -0.7s;
}
.spinner .rect6 {
  -webkit-animation-delay: -0.6s;
  animation-delay: -0.6s;
}

@-webkit-keyframes sk-stretchdelay {
  0%, 40%, 100% { -webkit-transform: scaleY(0.4) }  
  20% { -webkit-transform: scaleY(1.0) }
}

@keyframes sk-stretchdelay {
  0%, 40%, 100% { 
    transform: scaleY(0.4);
    -webkit-transform: scaleY(0.4);
  }  20% { 
    transform: scaleY(1.0);
    -webkit-transform: scaleY(1.0);
  }
}
</style>