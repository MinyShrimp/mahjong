
function People() {
    this.score = 30000;
    this.star = 0;
}

function Mahjong() {
    this.peoples = [new People(), new People(), new People(), new People()];
    this.first = 1;
    this.prolongation = 0;
    this.public_score = 0;
}

Mahjong.prototype.__ceil = function (value) {
    return Math.ceil(value / 100) * 100;
}

Mahjong.prototype.__getScore = function (p, pan, bu) {
    return Math.pow(2, (parseInt(pan) + 2)) * bu * (this.first == p ? 1.5 : 1.0);
}

Mahjong.prototype._getScore = function (p, pan, bu) {
    var _score = this.__ceil(this.__getScore(p, pan, bu) * 4);
    var _star = 0;
    if ((pan == 4 && bu > 30) || pan == 5) {
        _score = 8000 * (this.first == p ? 1.5 : 1.0);
    } else if (pan == 6 || pan == 7) {
        _score = 12000 * (this.first == p ? 1.5 : 1.0);
        _star = 1;
    } else if (pan >= 8 && pan <= 10) {
        _score = 16000 * (this.first == p ? 1.5 : 1.0);
        _star = 2;
    } else if (pan == 11 || pan == 12) {
        _score = 24000 * (this.first == p ? 1.5 : 1.0);
        _star = 3;
    } else if (pan >= 13) {
        _score = 32000 * (this.first == p ? 1.5 : 1.0);
        _star = 5;
    }
    return [_score, _star];
}

Mahjong.prototype._addFirst = function (p, type=1) {
    if (p == this.first) {
        this.prolongation += 1;
    } else {
        this.first = (this.first != 4) ? this.first + 1 : 1;
        if(type == 1) { this.prolongation = 0; }
        else if(type == 9999) { this.prolongation += 1; }
    }

    var btns = document.getElementsByClassName("btns");
    btns[this.first - 1].classList.add("select");
    for (var i = 0; i < 4; i++) {
        if (i != (this.first - 1)) { btns[i].classList.remove("select"); }
    }
}

Mahjong.prototype.Tsumo = function (p, pan, bu) {
    var _score_zip = this._getScore(p, pan, bu);
    var _score = _score_zip[0]; var _star = _score_zip[1];

    if (this.first == p) {
        _score = this.__ceil(_score / 3);

        this.peoples[p - 1].score += (_score * 3 + this.prolongation * 300) + this.public_score;
        this.peoples[p - 1].star += _star;

        for (var i = 0; i < 4; i++) {
            if (i != (p - 1)) { this.peoples[i].score -= (_score + this.prolongation * 100); }
        }
    } else {
        var _score_child = this.__ceil(_score / 4);
        var _score_parent = this.__ceil(_score / 2);

        this.peoples[p - 1].score += (_score_parent + _score_child * 2 + this.prolongation * 300) + this.public_score;
        this.peoples[p - 1].star += _star;

        this.peoples[this.first - 1].score -= _score_parent + this.prolongation * 100;
        for (var i = 0; i < 4; i++) {
            if (i != (p - 1) && i != (this.first - 1)) { this.peoples[i].score -= (_score_child + this.prolongation * 100); }
        }
    }

    this._addFirst(p);
    this.public_score = 0;
}

Mahjong.prototype.Lon = function (p1, p2, pan, bu) {
    var _score_zip = this._getScore(p1, pan, bu);
    var _score = _score_zip[0]; _star = _score_zip[1];

    this.peoples[p1 - 1].score += _score + this.public_score;
    this.peoples[p1 - 1].star += _star;
    this.peoples[p2 - 1].score -= _score;

    this._addFirst(p1);
    this.public_score = 0;
}

Mahjong.prototype.Foul = function (p) {
    this.peoples[p - 1].score -= 9000;
    for (var i = 0; i < 4; i++) {
        if (i != (p - 1)) { this.peoples[i].score += 3000; }
    }
    if (p == this.first) {
        this._addFirst(9999);
    }
}

// 발성 미스
Mahjong.prototype.Miss = function (p) {
    this.peoples[p - 1].score -= 1000;
    this.public_score += 1000;
    show_score();
}

// 유국
Mahjong.prototype.Terminal = function (arr) {
    console.log(arr);
    if (arr.length == 0) {
        this._addFirst(9999, 9999);
    } else if (arr.length == 1) {
        this.peoples[arr[0] - 1].score += 3000;
        for (var i = 0; i < 4; i++) {
            if (i != (arr[0] - 1)) { this.peoples[i].score -= 1000; }
        }
        this._addFirst(arr[0], 9999);
    } else if (arr.length == 2) {
        this.peoples[arr[0] - 1].score += 1500;
        this.peoples[arr[1] - 1].score += 1500;
        for (var i = 0; i < 4; i++) {
            if (i != (arr[0] - 1) && i != (arr[1] - 1)) { this.peoples[i].score -= 1500; }
        }
        this._addFirst((this.first == arr[0] || this.first == arr[1]) ? this.first : 9999, 9999);
    } else if (arr.length == 3) {
        var sum = 0;
        for (var i = 0; i < 3; i++) {
            this.peoples[arr[i] - 1].score += 1000;
            sum += arr[i];
        }
        this.peoples[9 - sum].score -= 3000;
        this._addFirst((10 - sum) == this.first ? 9999 : this.first, 9999);
    } else if (arr.length == 4) {
        this._addFirst(this.first, 9999);
    }
}

var mahjong = new Mahjong();

function show_score() {
    var _documents_public = document.getElementById("public-score");
    var _documents_score  = document.getElementsByName("score");
    var _documents_star   = document.getElementsByName("star");
    
    for (var i = 0; i < 4; i++) {
        _documents_score[i].innerHTML = mahjong.peoples[i].score;
        _documents_star[i].innerHTML = "★: " + mahjong.peoples[i].star;
    }
    _documents_public.innerHTML = "연짱 : " + mahjong.prolongation + "<br>공탁금 : " + mahjong.public_score;
}

function btn_click(obj) {
    var hwa = document.getElementById("hwa");
    var pan = document.getElementById("pan");
    var bu  = document.getElementById("bu");
    var so  = document.getElementById("so");
    switch (parseInt(hwa.value)) {
        case 0:
            alert('화료 방법을 선택하세요.');
            break;
        case 1:
            if (pan.value != 0) {
                if (pan.value <= 4) {
                    if (bu.value != 0) {
                        mahjong.Tsumo(obj.value, pan.value, bu.value);
                    } else {
                        alert('부수를 선택하세요.');
                    }
                } else {
                    mahjong.Tsumo(obj.value, pan.value, bu.value);
                }
            } else {
                alert('판수를 선택하세요.');
            }
            break;
        case 2:
            if (obj.value == so.value) {
                alert('쏘인 사람과 쏜 사람이 같은 인물입니다.');
                break;
            }
            if (pan.value != 0) {
                if (pan.value <= 4) {
                    if (bu.value != 0) {
                        if (so.value != 0) {
                            mahjong.Lon(obj.value, so.value, pan.value, bu.value);
                        } else {
                            alert('쏘인 사람을 선택하세요.');
                        }
                    } else {
                        alert('부수를 선택하세요.');
                    }
                } else {
                    if (so.value != 0) {
                        mahjong.Lon(obj.value, so.value, pan.value, bu.value);
                    } else {
                        alert('쏘인 사람을 선택하세요.');
                    }
                }
            } else {
                alert('판수를 선택하세요.');
            }
            break;
        case 3:
            alert("정말 쵼보를 했습니까?");
            mahjong.Foul(obj.value);
            break;
    }
    show_score();
}

function hwa_click(obj) {
    switch (parseInt(obj.value)) {
        case 0:
        case 3:
            obj.style.top = "4em";
            document.getElementById("pan").style.display = "none";
            document.getElementById("bu").style.display = "none";
            document.getElementById("so").style.display = "none";
            document.getElementById("checkboxs").style.display = "none";
            break;
        case 1:
            obj.style.top = "-2em";
            document.getElementById("pan").style.top = "4em";
            document.getElementById("bu").style.top = "10em";

            document.getElementById("pan").style.display = "inline";
            document.getElementById("bu").style.display = "inline";
            document.getElementById("so").style.display = "none";
            document.getElementById("checkboxs").style.display = "none";
            break;
        case 2:
            obj.style.top = "-3em";
            document.getElementById("pan").style.top = "2em";
            document.getElementById("bu").style.top = "7em";
            document.getElementById("so").style.top = "12em";

            document.getElementById("pan").style.display = "inline";
            document.getElementById("bu").style.display = "inline";
            document.getElementById("so").style.display = "inline";
            document.getElementById("checkboxs").style.display = "none";
            break;
        case 4:
            obj.style.top = "3.5em";
            document.getElementById("pan").style.display = "none";
            document.getElementById("bu").style.display = "none";
            document.getElementById("so").style.display = "none";
            document.getElementById("checkboxs").style.display = "";
            break;
    }
}

function pan_click(obj) {
    if (obj.value == 1) {
        document.getElementById("1pan").style.display = "none";
    } else {
        document.getElementById("1pan").style.display = "";
    }
    if (obj.value == 0 || obj.value >= 5) {
        document.getElementById("bu").value = 0;
        document.getElementById("bu").disabled = true;
    } else {
        document.getElementById("bu").disabled = false;
    }
}

function miss_click(obj) {
    mahjong.Miss(obj.value);
}

function terminal_click() {
    var t = document.getElementsByName("terminal");
    var _arr = [];
    for(var i = 0; i < 4; i++) {
        if( t[i].checked ) { _arr.push(i + 1); }
    }
    mahjong.Terminal(_arr);
    show_score();
}